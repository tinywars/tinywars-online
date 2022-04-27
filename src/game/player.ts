import { CircleCollider } from "../utility/circle-collider";
import { Controller } from "../utility/controller";
import { Vector } from "../utility/vector";
import { eventSpawnProjectile } from "../events/game-event";
import { KeyCode } from "../game/key-codes";
import { GameContext } from "./game-context";
import { GameObject } from "./game-object";

export class Player extends GameObject {
    protected direction: Vector = Vector.zero();
    protected forward: Vector = Vector.zero();
    protected speed = 0;

    constructor(
        private controller: Controller,
    ) {
        super();
        this.collider = new CircleCollider(
            Vector.outOfView(),
            16
        );
    }

    spawn(position: Vector) {
        this.collider.setPosition(position);
        this.direction = new Vector(1, 0);
        this.forward = new Vector(0, 0);
        this.rotation = 0;
    }

    despawn() {
        this.collider.setPosition(Vector.outOfView());
    }

    update(dt: number, context: GameContext) {
        let updateFwd = true;
        let rotation = 0;
        if (this.controller.isKeyPressed(KeyCode.Up)) {
            this.speed = context.PLAYER_FORWARD_SPEED;
        } else if (this.controller.isKeyPressed(KeyCode.Down)) {
            this.speed = -context.PLAYER_FORWARD_SPEED;
        } else updateFwd = false;

        if (this.controller.isKeyPressed(KeyCode.Left)) {
            rotation = -context.PLAYER_ROTATION_SPEED;
        } else if (this.controller.isKeyPressed(KeyCode.Right)) {
            rotation = context.PLAYER_ROTATION_SPEED;
        }

        if (this.controller.isKeyPressed(KeyCode.Shoot)) {
            this.controller.releaseKey(KeyCode.Shoot);

            context.eventQueue.add(
                eventSpawnProjectile(
                    this.collider.getPosition(), 
                    this.direction, 
                    context.PROJECTILE_DAMAGE));
        }

        this.updateRotation(rotation, dt);
        this.moveForward(updateFwd, dt, context);   
    }

    private updateRotation(frameRotation: number, dt: number) {
        this.rotation += frameRotation * dt;
        if (this.rotation >= 360) this.rotation -= 360;
        else if (this.rotation < 0) this.rotation += 360;
        this.direction.setRotation(this.rotation);
    }

    private moveForward(updateForward: boolean, dt: number, context: GameContext) {
        if (updateForward)
            this.forward = this.direction.getScaled(this.speed);

        this.collider.move(this.forward.getScaled(dt));
        this.handleLeavingScreen(context);     
    }

    private handleLeavingScreen(context: GameContext) {
        const pos = this.collider.getPosition();
        if (pos.x < 0) pos.x += context.SCREEN_WIDTH;
        else if (pos.x >= context.SCREEN_WIDTH)
            pos.x -= context.SCREEN_WIDTH;
        if (pos.y < 0) pos.y += context.SCREEN_HEIGHT;
        else if (pos.y >= context.SCREEN_HEIGHT)
            pos.y -= context.SCREEN_HEIGHT;
        this.collider.setPosition(pos);
    }
}
