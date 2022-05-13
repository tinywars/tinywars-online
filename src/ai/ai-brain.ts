import { GameContext } from "../game/game-context";
import { KeyCode } from "../game/key-codes";
import { Player } from "../game/player";
import { Vector } from "../utility/vector";
import { AiPoweredController } from "./ai-controller";
import { getTimeBeforeCollision, sanitizeAngle } from "../utility/math";
import { GameObject } from "../game/game-object";
import { FastArray } from "../utility/fast-array";
import { assert } from "chai";
import { Fsm, FsmTransitionCondition } from "./fsm";
import * as GameMath from "../utility/math";
import { If, Do, DoNothing } from "./fsm-builder";
import { Timer } from "../utility/timer";
import { CircleCollider } from "../utility/circle-collider";
import { PRNG } from "../utility/prng";

export enum State {
    Start,
    EndgameCheck,
    PickingTarget,
    TrackingAndShooting,
    StartEvasion,
    Evading,
    FinishEvasion,
    Drifting,
    Shoot,
}

enum TargetingStrategy {
    Closest,
    Weakest,
}

enum ETimer {
    Fire,
    GoForward,
    Log,
}

export function not(condition: FsmTransitionCondition): FsmTransitionCondition {
    return (context: GameContext) => {
        return !condition(context);
    };
}

export function and(
    cond1: FsmTransitionCondition,
    cond2: FsmTransitionCondition,
): FsmTransitionCondition {
    return (context: GameContext) => {
        return cond1(context) && cond2(context);
    };
}

export function alwaysTrue(): boolean {
    return true;
}

export function nothing() {
    // intentionally left blank
}

export class AiBrain {
    private timers: Record<ETimer, Timer>;
    private targetAngle = 0;
    private fsm: Fsm;
    private targetingStrategy: TargetingStrategy = TargetingStrategy.Closest;
    private targetPlayer: Player;
    private ANGLE_DIFF_THRESHOLD = 5;

    constructor(
        private controller: AiPoweredController,
        private myPlayer: Player,
        options: {
            MIN_SHOOT_DELAY: number;
            MAX_SHOOT_DELAY: number;
        },
    ) {
        const states = {
            /* eslint-disable */
            [State.Start]:
                 Do(this.goForward)
                .thenGoTo(State.PickingTarget),
            [State.EndgameCheck]:
                 If(this.isEverybodyElseDead).goTo(State.Drifting)
                .otherwiseDo(nothing).thenGoTo(State.PickingTarget),
            [State.PickingTarget]:
                If(this.isEverybodyElseDead).goTo(State.Drifting)
                .otherwiseDo(this.pickTargetPlayer).thenGoTo(State.TrackingAndShooting),
            [State.TrackingAndShooting]: 
                 If(this.isCollisionImminent).goTo(State.StartEvasion)
                .orIf(this.isEverybodyElseDead).goTo(State.Drifting)
                .orIf(this.isTargetDead).goTo(State.EndgameCheck) // then to PickingTarget
                .orIf(and(this.timerEnded(ETimer.Fire),this.isCloseEnoughToTarget)).goTo(State.Shoot)
                .orIf(and(this.timerEnded(ETimer.GoForward),this.noCollisionInLookDirection)).goTo(State.Start)
                .otherwiseDo(this.trackTarget).andLoop(),
            [State.Shoot]:
                Do(this.shoot).thenGoTo(State.TrackingAndShooting),
            [State.StartEvasion]:
                 Do(this.pickEvasionAngle)
                .thenGoTo(State.Evading),
            [State.Evading]: 
                 If(this.isEvasionAngleAchieved).goTo(State.FinishEvasion)
                .otherwiseDo(this.rotateTowardsTarget).andLoop(),
            [State.FinishEvasion]:
                 Do(this.performEvasion)
                .thenGoTo(State.TrackingAndShooting),
            [State.Drifting]: DoNothing(),
            /* eslint-enable */
        };
        this.fsm = new Fsm(states, State.Start);
        this.targetPlayer = this.myPlayer; // just to satisfy linter

        if (this.myPlayer.id % 2 === 1) {
            this.targetingStrategy = TargetingStrategy.Weakest;
        }

        this.timers = {
            [ETimer.Fire]: new Timer(
                () =>
                    PRNG.randomFloat() *
                        (options.MAX_SHOOT_DELAY - options.MIN_SHOOT_DELAY) +
                    options.MIN_SHOOT_DELAY,
            ),
            [ETimer.GoForward]: new Timer(() => PRNG.randomFloat() * 3 + 1.5),
            [ETimer.Log]: new Timer(() => 1),
        };
    }

    update(dt: number, context: GameContext) {
        this.releaseInputs();
        this.updateTimers(dt);

        this.fsm.update(context);

        if (this.myPlayer.id === 0 && this.timers[ETimer.Log].ended()) {
            console.log(State[this.fsm.getState()]);
            this.timers[ETimer.Log].reset();
        }
    }

    reset() {
        this.fsm.setState(State.Start);
    }

    /* NON FSM METHODS */
    private releaseInputs() {
        this.controller.releaseKey(KeyCode.Up);
        this.controller.releaseKey(KeyCode.Down);
        this.controller.releaseKey(KeyCode.Left);
        this.controller.releaseKey(KeyCode.Right);
        this.controller.releaseKey(KeyCode.Shoot);
        this.controller.releaseKey(KeyCode.Action);
    }

    private updateTimers(dt: number) {
        Object.values(this.timers).forEach((t) => t.update(dt));
    }

    private getClosestPlayer(players: Player[]): Player {
        let result: Player = players[0];
        let smallestDistance = Infinity;

        for (let i = 1; i < players.length; i++) {
            const distance = Vector.diff(
                players[i].getCollider().getPosition(),
                this.myPlayer.getCollider().getPosition(),
            ).getSize();

            if (distance < smallestDistance) {
                result = players[i];
                smallestDistance = distance;
            }
        }

        return result;
    }

    private getWeakestPlayer(players: Player[]): Player {
        let result: Player = players[0];

        for (let i = 1; i < players.length; i++) {
            if (result.getHealth() > players[i].getHealth())
                result = players[i];
        }

        return result;
    }

    private getOtherPlayers(players: FastArray<Player>): Player[] {
        return players.filter((p) => {
            return p.id != this.myPlayer.id;
        });
    }

    private targetObject(myPlayer: Player, object: GameObject) {
        const targetPoint =
            GameMath.getIntersectionBetweenMovingPointAndGrowingCircle(
                object.getCollider().getPosition(),
                object.getForward(),
                myPlayer.getCollider().getPosition(),
                1000,
            );
        if (targetPoint === null) return;

        const direction = Vector.diff(
            targetPoint,
            myPlayer.getCollider().getPosition(),
        );
        this.targetAngle = direction.toAngle();
    }

    private isCollisionImminentForGivenFastArray(
        myCollider: CircleCollider,
        myForward: Vector,
        objects: FastArray<GameObject>,
    ) {
        let result = false;
        const COLLISION_CRITICAL_TIME = 1;

        objects.forEach((o) => {
            const t = getTimeBeforeCollision(
                myCollider,
                o.getCollider(),
                myForward,
                o.getForward(),
            );

            if (t !== null) result = result || t < COLLISION_CRITICAL_TIME;
        });

        return result;
    }

    private getDiffFromTargetAngle = (): number => {
        return GameMath.radialDifference(
            this.targetAngle,
            this.myPlayer.getCoords().angle,
        );
    };

    /* FSM CONDITIONS */
    private isEverybodyElseDead = (context: GameContext): boolean => {
        return context.players.getSize() <= 1;
    };

    private isTargetDead = (): boolean => {
        return this.targetPlayer.getHealth() <= 0;
    };

    private isCloseEnoughToTarget = (): boolean => {
        return (
            Vector.diff(
                this.myPlayer.getCoords().position,
                this.targetPlayer.getCoords().position,
            ).getSize() < 300
        );
    };

    private timerEnded(id: ETimer): FsmTransitionCondition {
        return (): boolean => {
            return this.timers[id].ended();
        };
    }

    private noCollisionInLookDirection = (context: GameContext): boolean => {
        return !this.isCollisionImminentForGivenFastArray(
            this.myPlayer.getCollider(),
            Vector.fromPolar(
                this.myPlayer.getCoords().angle,
                this.myPlayer.getForward().getSize(),
            ),
            context.obstacles,
        );
    };

    private isTargetAngleAchieved = (): boolean => {
        return this.getDiffFromTargetAngle() < this.ANGLE_DIFF_THRESHOLD;
    };

    private isEvasionAngleAchieved = (): boolean => {
        const diff = this.getDiffFromTargetAngle();
        return (
            diff < this.ANGLE_DIFF_THRESHOLD ||
            diff - 180 < this.ANGLE_DIFF_THRESHOLD
        );
    };

    private isCollisionImminent = (context: GameContext) => {
        const result =
            this.isCollisionImminentForGivenFastArray(
                this.myPlayer.getCollider(),
                this.myPlayer.getForward(),
                context.obstacles,
            ) ||
            this.isCollisionImminentForGivenFastArray(
                this.myPlayer.getCollider(),
                this.myPlayer.getForward(),
                context.projectiles,
            );

        if (result) console.log(this.myPlayer.id + ": Collision imminent");
        return result;
    };

    /* FSM LOGIC */
    private goForward = () => {
        this.controller.pressKey(KeyCode.Up);
        this.timers[ETimer.GoForward].reset();
    };

    private shoot = () => {
        this.controller.pressKey(KeyCode.Shoot);
        this.timers[ETimer.Fire].reset();
    };

    private performEvasion = () => {
        const diff = this.getDiffFromTargetAngle();
        if (diff < this.ANGLE_DIFF_THRESHOLD)
            this.controller.pressKey(KeyCode.Up);
        else this.controller.pressKey(KeyCode.Down);
    };

    private rotateTowardsTarget = () => {
        const myAngle = this.myPlayer.getCoords().angle;
        const diffAngle = sanitizeAngle(myAngle - this.targetAngle);
        if (diffAngle <= 180) this.controller.pressKey(KeyCode.Left);
        else if (diffAngle > 180) this.controller.pressKey(KeyCode.Right);
    };

    private trackTarget = () => {
        this.targetObject(this.myPlayer, this.targetPlayer);
        this.rotateTowardsTarget();
    };

    private pickTargetPlayer = (context: GameContext) => {
        const otherPlayers = this.getOtherPlayers(context.players);
        assert(
            otherPlayers.length,
            "Programmatic error: This function should never be called if there are no other players",
        );

        switch (this.targetingStrategy) {
            case TargetingStrategy.Closest:
                this.targetPlayer = this.getClosestPlayer(otherPlayers);
                break;
            case TargetingStrategy.Weakest:
                this.targetPlayer = this.getWeakestPlayer(otherPlayers);
                break;
        }
    };

    private pickEvasionAngle = () => {
        this.targetAngle = sanitizeAngle(
            this.myPlayer.getForward().toAngle() +
                90 +
                PRNG.randomRangedInt(0, 180),
        );
    };
}
