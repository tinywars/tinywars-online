import { Circle } from "pixi.js";
import { CircleCollider } from "../utility/circle-collider";
import { Vector } from "../utility/vector";
import { GameContext } from "./game-context";

export abstract class GameObject {
    protected hash = Math.random().toString(36).slice(-20);
    protected collider: CircleCollider = new CircleCollider(new Vector(0, 0), 0); // dummy va
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
