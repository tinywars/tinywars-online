import { CircleCollider } from "../utility/circle-collider";
import { Vector } from "../utility/vector";
import { GameContext } from "./game-context";

export abstract class GameObject {
    protected hash = Math.random().toString(36).slice(-10);
    protected MAX_FORWARD_SPEED = 64;
    protected MAX_ROTATION_SPEED = 64;

    // protected sprite: Sprite;
    protected collider: CircleCollider = new CircleCollider(
        new Vector(0, 0),
        16,
    );

    protected position: Vector = new Vector(0, 0);
    protected direction: Vector = new Vector(0, 0);
    protected forward: Vector = new Vector(0, 0);
    protected rotation = 0;
    protected speed = 0;

    abstract update(dt: number, context: GameContext): void;

    getHash() {
        return Object.getPrototypeOf(this).name + this.hash;
    }

    getCollider() {
        return this.collider;
    }

    getCoords() {
        return {
            x: this.position.x,
            y: this.position.y,
            angle: this.rotation,
        };
    }
}
