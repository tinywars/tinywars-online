import { GameContext } from "../game/game-context";
import { KeyCode } from "../game/key-codes";
import { Player } from "../game/player";
import { Vector } from "../utility/vector";
import { AiPoweredController } from "./ai-controller";
import { getTimeBeforeCollision, sanitizeAngle } from "../utility/math";
import { GameObject } from "../game/game-object";
import { FastArray } from "../utility/fast-array";

enum AiState {
    Start,
    TrackingAndShooting,
    Evading,
    Drifting,
}

export class AiBrain {
    private shootTimeout = 0;
    private aiState = AiState.Start;
    private targetAngle = 0;

    constructor(
        private controller: AiPoweredController,
        private playerId: number,
    ) {}

    update(dt: number, context: GameContext) {
        this.controller.releaseKey(KeyCode.Up);
        this.controller.releaseKey(KeyCode.Down);
        this.controller.releaseKey(KeyCode.Left);
        this.controller.releaseKey(KeyCode.Right);
        this.controller.releaseKey(KeyCode.Shoot);

        const myPlayer = this.getPlayerReference(context);
        if (myPlayer === null) return; // player is dead, nothing to control

        /**
         * Note the structure of following FSM:
         * Each state starts with series of test for
         * transitions into different states.
         *
         * If a test succeeds, a bootstrap logic (state with default transition)
         * is carried out and then the state is changed.
         *
         * If no transition should occur, default state
         * logic is executed instead.
         */
        switch (this.aiState) {
            case AiState.Start:
                this.controller.pressKey(KeyCode.Up);
                this.shootTimeout =
                    Math.random() * context.settings.AI_MIN_SHOOT_DELAY +
                    context.settings.AI_MIN_SHOOT_DELAY;
                this.aiState = AiState.TrackingAndShooting;
                break;

            case AiState.TrackingAndShooting: {
                if (this.isCollisionImminent(myPlayer, context)) {
                    this.targetAngle = this.pickEvasionAngle(myPlayer);
                    this.aiState = AiState.Evading;
                    return;
                }

                const closestPlayer = this.pickClosestPlayer(myPlayer, context);
                if (closestPlayer === null) {
                    this.aiState = AiState.Drifting;
                    return;
                }

                this.targetObject(myPlayer, closestPlayer);
                this.rotateTowardsTarget(myPlayer);

                this.shootTimeout -= dt;
                if (this.shootTimeout <= 0) {
                    this.controller.pressKey(KeyCode.Shoot);
                    this.shootTimeout =
                        Math.random() * context.settings.AI_MIN_SHOOT_DELAY +
                        context.settings.AI_MIN_SHOOT_DELAY;
                }
                break;
            }

            case AiState.Evading: {
                console.log(
                    myPlayer.id +
                        ": evading " +
                        myPlayer.getCoords().angle +
                        "->" +
                        this.targetAngle,
                );
                if (this.isTargetAngleAchieved(myPlayer)) {
                    console.log(myPlayer.id + ": evade angle achieved");
                    this.controller.pressKey(
                        (Math.random() * 10) % 2 == 0
                            ? KeyCode.Up
                            : KeyCode.Down,
                    );
                    this.aiState = AiState.TrackingAndShooting;
                    return;
                }

                this.rotateTowardsTarget(myPlayer);
                break;
            }

            default:
            case AiState.Drifting:
                // drifting, do nothing, you're last
                // player alive
                break;
        }
    }

    reset() {
        this.aiState = AiState.Start;
    }

    private getPlayerReference(context: GameContext): Player | null {
        for (let i = 0; i < context.players.getSize(); i++)
            if (context.players.getItem(i).id === this.playerId)
                return context.players.getItem(i);
        return null;
    }

    private pickClosestPlayer(
        myPlayer: Player,
        context: GameContext,
    ): Player | null {
        let closestPlayer: Player | null = null;
        let smallestDistance = Infinity;

        for (const player of context.players) {
            if (player.id == this.playerId) continue;

            const distance = Vector.diff(
                player.getCollider().getPosition(),
                myPlayer.getCollider().getPosition(),
            ).getSize();

            if (distance < smallestDistance) {
                closestPlayer = player;
                smallestDistance = distance;
            }
        }

        return closestPlayer;
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

    private isCollisionImminent(myPlayer: Player, context: GameContext) {
        const result =
            this.isCollisionImminentForGivenFastArray(
                myPlayer,
                context.obstacles,
            ) ||
            this.isCollisionImminentForGivenFastArray(
                myPlayer,
                context.projectiles,
            );

        // TODO: want to test players once we enable collisions between them

        if (result) console.log(myPlayer.id + ": Collision imminent");
        return result;
    }

    private pickEvasionAngle(myPlayer: Player): number {
        return sanitizeAngle(myPlayer.getForward().toAngle() + 90);
    }

    private isTargetAngleAchieved(myPlayer: Player): boolean {
        const myAngle = myPlayer.getCoords().angle;
        const diffAngle = Math.abs(this.targetAngle - myAngle);
        // There's some weird issue with rotateTowardsAngle, so it always
        // becomes stuck in opposite direction
        return diffAngle < 5; // || diffAngle - 180 < 5;
    }

    private rotateTowardsTarget(myPlayer: Player) {
        const myAngle = myPlayer.getCoords().angle;
        const diffAngle = sanitizeAngle(myAngle - this.targetAngle);
        if (diffAngle <= 180) this.controller.pressKey(KeyCode.Left);
        else if (diffAngle > 180) this.controller.pressKey(KeyCode.Right);
    }
}
