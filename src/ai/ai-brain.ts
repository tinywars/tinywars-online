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
    return (self: AiBrain, context: GameContext) => {
        return !condition(self, context);
    };
}

export function and(
    cond1: FsmTransitionCondition,
    cond2: FsmTransitionCondition,
): FsmTransitionCondition {
    return (self: AiBrain, context: GameContext) => {
        return cond1(self, context) && cond2(self, context);
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
                 Do(this.pickTargetPlayer)
                .thenGoTo(State.TrackingAndShooting),
            [State.TrackingAndShooting]: 
                 If(this.isCollisionImminent).goTo(State.StartEvasion)
                .orIf(this.isEverybodyElseDead).goTo(State.Drifting)
                .orIf(this.isTargetDead).goTo(State.EndgameCheck) // then to PickingTarget
                .orIf(this.timerEnded(ETimer.Fire)).goTo(State.Shoot)
                //.orIf(and(this.timerEnded(ETimer.GoForward),this.noCollisionInLookDirection)).goTo(State.Start)
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
                    Math.random() *
                        (options.MAX_SHOOT_DELAY - options.MIN_SHOOT_DELAY) +
                    options.MIN_SHOOT_DELAY,
            ),
            [ETimer.GoForward]: new Timer(() => 0.5),
            [ETimer.Log]: new Timer(() => 1),
        };
    }

    update(dt: number, context: GameContext) {
        this.releaseInputs();
        this.updateTimers(dt);

        this.fsm.update(this, context);

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
        this.controller.releaseKey(KeyCode.Boost);
    }

    private updateTimers(dt: number) {
        for (const timer in this.timers) {
            const t = (this.timers as any)[timer];
            if (t !== undefined) {
                t.update(dt);
            }
        }
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
        // TODO: improve
        const direction = Vector.diff(
            object
                .getCollider()
                .getPosition()
                .getSum(object.getForward().getScaled(0.5)),
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
        const COLLISION_CRITICAL_TIME = 2;

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

    private getDiffFromTargetAngle(): number {
        return GameMath.radialDifference(
            this.targetAngle,
            this.myPlayer.getCoords().angle,
        );
    }

    /* FSM CONDITIONS */
    private isEverybodyElseDead(self: AiBrain, context: GameContext): boolean {
        return context.players.getSize() <= 1;
    }

    private isTargetDead(self: AiBrain): boolean {
        return self.targetPlayer.getHealth() <= 0;
    }

    private isCloseEnoughToTarget(self: AiBrain): boolean {
        return (
            Vector.diff(
                self.myPlayer.getCoords().position,
                self.targetPlayer.getCoords().position,
            ).getSize() < 300
        );
    }

    private timerEnded(id: ETimer): FsmTransitionCondition {
        return (self: AiBrain): boolean => {
            return self.timers[id].ended();
        };
    }

    private noCollisionInLookDirection(
        self: AiBrain,
        context: GameContext,
    ): boolean {
        return self.isCollisionImminentForGivenFastArray(
            self.myPlayer.getCollider(),
            Vector.fromPolar(
                self.myPlayer.getCoords().angle,
                self.myPlayer.getForward().getSize(),
            ),
            context.obstacles,
        );
    }

    private isTargetAngleAchieved(self: AiBrain): boolean {
        return self.getDiffFromTargetAngle() < self.ANGLE_DIFF_THRESHOLD;
    }

    private isEvasionAngleAchieved(self: AiBrain): boolean {
        const diff = self.getDiffFromTargetAngle();
        return (
            diff < self.ANGLE_DIFF_THRESHOLD ||
            diff - 180 < self.ANGLE_DIFF_THRESHOLD
        );
    }

    private isCollisionImminent(self: AiBrain, context: GameContext) {
        const result =
            self.isCollisionImminentForGivenFastArray(
                self.myPlayer.getCollider(),
                self.myPlayer.getForward(),
                context.obstacles,
            ) ||
            self.isCollisionImminentForGivenFastArray(
                self.myPlayer.getCollider(),
                self.myPlayer.getForward(),
                context.projectiles,
            );

        if (result) console.log(self.myPlayer.id + ": Collision imminent");
        return result;
    }

    /* FSM LOGIC */
    private goForward(self: AiBrain) {
        self.controller.pressKey(KeyCode.Up);
        self.timers[ETimer.GoForward].reset();
    }

    private shoot(self: AiBrain) {
        self.controller.pressKey(KeyCode.Shoot);
        self.timers[ETimer.Fire].reset();
    }

    private performEvasion(self: AiBrain) {
        const diff = self.getDiffFromTargetAngle();
        if (diff < self.ANGLE_DIFF_THRESHOLD)
            self.controller.pressKey(KeyCode.Up);
        else self.controller.pressKey(KeyCode.Down);
    }

    private rotateTowardsTarget(self: AiBrain) {
        const myAngle = self.myPlayer.getCoords().angle;
        const diffAngle = sanitizeAngle(myAngle - self.targetAngle);
        if (diffAngle <= 180) self.controller.pressKey(KeyCode.Left);
        else if (diffAngle > 180) self.controller.pressKey(KeyCode.Right);
    }

    private trackTarget(self: AiBrain) {
        self.targetObject(self.myPlayer, self.targetPlayer);
        self.rotateTowardsTarget(self);

        if (self.myPlayer.id === 0 && self.timers[ETimer.Log].ended()) {
            console.log(
                self.myPlayer.getCollider().getPosition().toString() +
                    " -> " +
                    self.targetPlayer.getCollider().getPosition().toString() +
                    " @ " +
                    self.targetAngle,
            );
        }
    }

    private pickTargetPlayer(self: AiBrain, context: GameContext) {
        const otherPlayers = self.getOtherPlayers(context.players);
        assert(
            otherPlayers.length,
            "Programmatic error: This function should never be called if there are no other players",
        );

        switch (self.targetingStrategy) {
            case TargetingStrategy.Closest:
                self.targetPlayer = self.getClosestPlayer(otherPlayers);
                break;
            case TargetingStrategy.Weakest:
                self.targetPlayer = self.getWeakestPlayer(otherPlayers);
                break;
        }
    }

    private pickEvasionAngle(self: AiBrain) {
        // TODO: better algorithm here
        self.targetAngle = sanitizeAngle(
            self.myPlayer.getForward().toAngle() + 90,
        );
    }
}
