import { CircleCollider } from "../utility/circle-collider";
import { Vector } from "../utility/vector";
import { GameContext } from "./game-context";

export abstract class GameObject {
    protected hash = Math.random().toString(36).slice(-20);
    // dummy values, must be overriden in derived ctor
    protected collider: CircleCollider = new CircleCollider(Vector.zero(), 0);
    protected rotation = 0;

    abstract update(dt: number, context: GameContext): void;

    getHash() {
        return Object.getPrototypeOf(this).name + this.hash;
    }

    getCollider(): CircleCollider {
        return this.collider;
    }

    getCoords() {
        return {
            x: this.collider.getPosition().x,
            y: this.collider.getPosition().y,
            angle: this.rotation,
        };
    }
}
