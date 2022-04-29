import { GameContext } from "../game/game-context";
import { KeyCode } from "../game/key-codes";
import { Player } from "../game/player";
import { Vector } from "../utility/vector";
import { AiPoweredController } from "./ai-controller";

export class AiBrain {
    private goForwardTimeout = 0;
    private shootTimeout = 0;
    private MAX_GO_FORWARD_TIMEOUT = 2;
    private MAX_SHOOT_DELAY = 5;
    private MIN_SHOOT_DELAY = 2;

    constructor(private controller: AiPoweredController, private playerId: number) {
        this.goForwardTimeout = Math.random() * this.MAX_GO_FORWARD_TIMEOUT + this.MAX_GO_FORWARD_TIMEOUT;
        this.shootTimeout = Math.random() * this.MAX_SHOOT_DELAY + this.MAX_SHOOT_DELAY;
    }

    update(dt: number, context: GameContext) {
        const myPlayer = this.getPlayerReference(context);
        if (myPlayer === null)
            return; // player is dead, nothing to control

        const closestPlayer = this.pickClosestPlayer(myPlayer, context);
        if (closestPlayer === null)
            return;
        
        this.rotateTowardsClosestPlayer(myPlayer, closestPlayer);

        this.goForwardTimeout -= dt;
        if (this.goForwardTimeout <= 0) {
            this.controller.pressKey(KeyCode.Up);
            this.goForwardTimeout = Math.random() * this.MAX_GO_FORWARD_TIMEOUT;
        }
        else {
            this.controller.releaseKey(KeyCode.Up);
        }

        this.shootTimeout -= dt;
        if (this.shootTimeout <= 0) {
            this.controller.pressKey(KeyCode.Shoot);
            this.shootTimeout = Math.random() * this.MAX_SHOOT_DELAY + this.MIN_SHOOT_DELAY;
        }
    }

    private getPlayerReference(context: GameContext): Player | null {
        for (let i = 0; i < context.players.getSize(); i++)
            if (context.players.getItem(i).id === this.playerId)
                return context.players.getItem(i);
        return null;
    }

    private pickClosestPlayer(myPlayer: Player, context: GameContext): Player | null {
        let closestPlayer: Player | null = null;
        let smallestDistance = Infinity;

        for (const player of context.players) {
            if (player.id == this.playerId)
                continue;

            const distance = Vector.diff(
                player.getCollider().getPosition(), 
                myPlayer.getCollider().getPosition()
            ).getSize();

            if (distance < smallestDistance) {
                closestPlayer = player;
                smallestDistance = distance;
            }
        }

        return closestPlayer;
    }

    private rotateTowardsClosestPlayer(myPlayer: Player, closestPlayer: Player) {
        const direction = Vector.diff(
            myPlayer.getCollider().getPosition(),
            closestPlayer.getCollider().getPosition(),
        );
        const targetAngle = direction.toAngle();
        const myAngle = myPlayer.getCoords().angle;
        const diffAngle = Math.abs(targetAngle - myAngle)

        if (diffAngle < 5) {
            this.controller.releaseKey(KeyCode.Left);
            this.controller.releaseKey(KeyCode.Right);
        }
        else if ((targetAngle > myAngle && diffAngle < 180)
            || (myAngle > targetAngle && diffAngle > 180)) {
            this.controller.pressKey(KeyCode.Left);
            this.controller.releaseKey(KeyCode.Right);
        }
        else if ((targetAngle > myAngle && diffAngle > 180)
            || (myAngle > targetAngle && diffAngle < 180)) {
            this.controller.releaseKey(KeyCode.Left);
            this.controller.pressKey(KeyCode.Right);
        }
    } 
}