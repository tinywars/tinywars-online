import { Sprite } from "../utility/sprite";
import { Vector } from "../utility/vector";
import { Controller } from "../utility/controller";
import { CircleCollider } from "../utility/circle-collider";
import { KeyCode } from "../game/key-codes";
import { GameContext } from "./game-context";
import * as constants from "../constants";

export class Player {
    private MAX_FORWARD_SPEED = 128;
    private MAX_ROTATION_SPEED = 96;

    private sprite: Sprite;
    private collider: CircleCollider = new CircleCollider(new Vector(0, 0), 16);

    private position: Vector = new Vector(0, 0);
    private direction: Vector = new Vector(0, 0);
    private forward: Vector = new Vector(0, 0);
    private rotation = 0;
    private speed = 0;

    constructor(private img: CanvasImageSource, private controller: Controller) {
        this.sprite = new Sprite(this.img, 0, 0, 32, 32);
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
            this.speed = this.MAX_FORWARD_SPEED;
        }
        else if (this.controller.isKeyPressed(KeyCode.Down)) {
            this.speed = -this.MAX_FORWARD_SPEED;
        }
        else
            updateFwd = false;

        if (this.controller.isKeyPressed(KeyCode.Left)) {
            rotation = -this.MAX_ROTATION_SPEED;
        }
        else if (this.controller.isKeyPressed(KeyCode.Right)) {
            rotation = this.MAX_ROTATION_SPEED;
        }

        this.rotation += rotation * dt;
        if (this.rotation >= 360)
            this.rotation -= 360;
        else if (this.rotation < 0)
            this.rotation += 360;

        this.direction.setRotation(this.rotation);

        if (updateFwd)
            this.forward = this.direction.getScaled(this.speed * dt);

        this.position.add(this.forward);
        if (this.position.x < 0) this.position.x += constants.GAME_SCREEN_WIDTH;
        else if (this.position.x >= constants.GAME_SCREEN_WIDTH) this.position.x -= constants.GAME_SCREEN_WIDTH;
        if (this.position.y < 0) this.position.y += constants.GAME_SCREEN_HEIGHT;
        else if (this.position.y >= constants.GAME_SCREEN_HEIGHT) this.position.y -= constants.GAME_SCREEN_HEIGHT;
        this.collider.setPosition(this.position.getSum(new Vector(16, 16)));
    }

    draw(canvas2d: CanvasRenderingContext2D) {
        this.sprite.setRotation(this.rotation);
        this.sprite.draw(canvas2d, this.position.x, this.position.y, 32, 32);
    }

    getCollider(): CircleCollider {
        return this.collider;
    }
}