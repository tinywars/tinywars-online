import { KeyCode } from "../game/key-codes";
import { Controller } from "../utility/controller";
import { Vector } from "../utility/vector";
import { GameContext } from "./game-context";
import { GameObject } from "./game-object";

export class Player extends GameObject {
    // private sprite: Sprite;

    constructor(
        //        private img: CanvasImageSource,
        private controller: Controller,
    ) {
        super();
    }

    spawn(position: Vector) {
        this.position = position;
        this.collider.setPosition(position.getSum(new Vector(16, 16)));
        this.direction = new Vector(1, 0);
        this.forward = new Vector(0, 0);
        this.rotation = 0;
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

        this.rotation += rotation * dt;
        if (this.rotation >= 360) this.rotation -= 360;
        else if (this.rotation < 0) this.rotation += 360;

        this.direction.setRotation(this.rotation);

        if (updateFwd) this.forward = this.direction.getScaled(this.speed * dt);

        this.position.add(this.forward);
        if (this.position.x < 0) this.position.x += context.SCREEN_WIDTH;
        else if (this.position.x >= context.SCREEN_WIDTH)
            this.position.x -= context.SCREEN_WIDTH;
        if (this.position.y < 0) this.position.y += context.SCREEN_HEIGHT;
        else if (this.position.y >= context.SCREEN_HEIGHT)
            this.position.y -= context.SCREEN_HEIGHT;
        this.collider.setPosition(this.position.getSum(new Vector(16, 16)));
    }
}
