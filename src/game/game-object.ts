import { CircleCollider } from "../utility/circle-collider";
import { Vector } from "../utility/vector";
import { GameContext } from "./game-context";

export abstract class GameObject {
    protected hash = Math.random().toString(36).slice(-20);
    // dummy values, must be overriden in derived ctor
    protected collider: CircleCollider = new CircleCollider(Vector.zero(), 0);
    protected forward: Vector = Vector.zero();
    protected rotation = 0;

    abstract update(dt: number, context: GameContext): void;

    getForward(): Vector {
        return this.forward;
    }

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

    protected handleLeavingScreenByWrappingAround(context: GameContext) {
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
