import { GameContext } from "../game/game-context";
import { KeyCode } from "../game/key-codes";
import { Player } from "../game/player";
import { Vector } from "../utility/vector";
import { AiPoweredController } from "./ai-controller";
import { getTimeBeforeCollision, sanitizeAngle } from "../utility/math";
import { GameObject } from "../game/game-object";
import { FastArray } from "../utility/fast-array";
import { assert } from "chai";
import { Fsm } from "./fsm";
import { If, Do, DoNothing, not } from "./fsm-builder";

export enum State {
    Start,
    PickingTarget,
    TrackingAndShooting,
    Hunting,
    StartEvasion,
    Evading,
    FinishEvasion,
    Drifting,
}

enum TargetingStrategy {
    Closest,
    Weakest,
}

export class AiBrain {
    private shootTimeout = 0;
    private goForwardTimeout = 0;
    private targetAngle = 0;
    private fsm: Fsm;
    private targetingStrategy: TargetingStrategy = TargetingStrategy.Closest;
    private targetPlayer: Player;

    constructor(
        private controller: AiPoweredController,
        private myPlayer: Player,
    ) {
        const states = {
            /* eslint-disable */
            [State.Start]:
                 Do(this.startStateFsmStateLogic)
                .thenGoTo(State.PickingTarget),
            [State.PickingTarget]:
                Do(this.pickTargetPlayer).thenGoTo(State.TrackingAndShooting),
                //Do(this.pickTargetPlayer).thenGoTo(State.Hunting),
            [State.Hunting]:
                 If(this.isCloseEnoughToTarget).goTo(State.TrackingAndShooting)
                .otherwiseDo(this.trackAndGoForward),
            [State.TrackingAndShooting]: 
                 If(this.isCollisionImminent).goTo(State.StartEvasion)
                .orIf(this.isEverybodyElseDead).goTo(State.Drifting)
                //.orIf(not(this.isCloseEnoughToTarget)).goTo(State.PickingTarget)
                .otherwiseDo(this.trackAndShoot),
            [State.StartEvasion]:
                 Do(this.pickEvasionAngle)
                .thenGoTo(State.Evading),
            [State.Evading]: 
                 If(this.isTargetAngleAchieved).goTo(State.FinishEvasion)
                .otherwiseDo(this.rotateTowardsTarget),
            [State.FinishEvasion]:
                 Do(this.randomlyGoForwardOrBackward)
                .thenGoTo(State.TrackingAndShooting,
            ),
            [State.Drifting]: DoNothing(),
            /* eslint-enable */
        };
        this.fsm = new Fsm(states, State.Start);
        this.targetPlayer = this.myPlayer; // just to satisfy linter

        if (this.myPlayer.id % 2 === 1) {
            this.targetingStrategy = TargetingStrategy.Weakest;
        }
    }

    update(dt: number, context: GameContext) {
        this.releaseInputs();
        this.updateTimers(dt);
        this.fsm.update(this, context);
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
        if (this.shootTimeout > 0) this.shootTimeout -= dt;
        if (this.goForwardTimeout > 0) this.goForwardTimeout -= dt;
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
        const direction = Vector.diff(
            myPlayer.getCollider().getPosition(),
            // aim a bit in front of the target
            object
                .getCollider()
                .getPosition()
                .getSum(object.getForward().getScaled(0.5)),
        );
        this.targetAngle = direction.toAngle();
    }

    private isCollisionImminentForGivenFastArray(
        myPlayer: Player,
        objects: FastArray<GameObject>,
    ) {
        let result = false;
        const COLLISION_CRITICAL_TIME = 2;

        objects.forEach((o) => {
            const t = getTimeBeforeCollision(
                myPlayer.getCollider(),
                o.getCollider(),
                myPlayer.getForward(),
                o.getForward(),
            );

            if (t !== null) result = result || t < COLLISION_CRITICAL_TIME;
        });

        return result;
    }

    /* FSM CONDITIONS */
    private isEverybodyElseDead(self: AiBrain, context: GameContext): boolean {
        return context.players.getSize() <= 1;
    }

    private isCloseEnoughToTarget(self: AiBrain): boolean {
        return (
            Vector.diff(
                self.myPlayer.getCoords().position,
                self.targetPlayer.getCoords().position,
            ).getSize() < 300
        );
    }

    private isTargetAngleAchieved(self: AiBrain): boolean {
        const myAngle = self.myPlayer.getCoords().angle;
        const diffAngle = Math.abs(self.targetAngle - myAngle);
        return diffAngle < 5;
    }

    private isCollisionImminent(self: AiBrain, context: GameContext) {
        const result =
            self.isCollisionImminentForGivenFastArray(
                self.myPlayer,
                context.obstacles,
            ) ||
            self.isCollisionImminentForGivenFastArray(
                self.myPlayer,
                context.projectiles,
            );

        // TODO: want to FsmCondition players once we enable collisions between them

        if (result) console.log(self.myPlayer.id + ": Collision imminent");
        return result;
    }

    /* FSM LOGIC */
    private startStateFsmStateLogic(self: AiBrain, context: GameContext) {
        console.log(self);
        self.randomlyGoForwardOrBackward(self);
        self.shootTimeout =
            Math.random() * context.settings.AI_MIN_SHOOT_DELAY +
            context.settings.AI_MIN_SHOOT_DELAY;
    }

    private randomlyGoForwardOrBackward(self: AiBrain) {
        self.controller.pressKey(
            (Math.random() * 10) % 2 == 0 ? KeyCode.Up : KeyCode.Down,
        );
    }

    private trackAndShoot(self: AiBrain, context: GameContext) {
        self.targetObject(self.myPlayer, self.targetPlayer);
        self.rotateTowardsTarget(self);

        if (self.shootTimeout <= 0) {
            self.controller.pressKey(KeyCode.Shoot);
            self.shootTimeout =
                Math.random() * context.settings.AI_MIN_SHOOT_DELAY +
                context.settings.AI_MIN_SHOOT_DELAY;
        }
    }

    private trackAndGoForward(self: AiBrain) {
        self.targetObject(self.myPlayer, self.targetPlayer);
        self.rotateTowardsTarget(self);

        if (self.goForwardTimeout <= 0) {
            self.controller.pressKey(KeyCode.Up);
            self.goForwardTimeout = 0.4;
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
        self.targetAngle = sanitizeAngle(
            self.myPlayer.getForward().toAngle() + 90,
        );
    }

    private rotateTowardsTarget(self: AiBrain) {
        const myAngle = self.myPlayer.getCoords().angle;
        const diffAngle = sanitizeAngle(myAngle - self.targetAngle);
        if (diffAngle <= 180) self.controller.pressKey(KeyCode.Left);
        else if (diffAngle > 180) self.controller.pressKey(KeyCode.Right);
    }
}
