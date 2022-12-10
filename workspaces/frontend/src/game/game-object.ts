import { CircleCollider } from "../utility/circle-collider";
import { Coords } from "../utility/coords";
import { Vector } from "../utility/vector";
import { GameContext } from "./game-context";

export abstract class GameObject {
    protected hash = "";
    // dummy values, must be overriden in derived ctor
    protected collider: CircleCollider = new CircleCollider(Vector.zero(), 0);
    protected forward: Vector = Vector.zero();
    protected rotation = 0;

    abstract update(dt: number, context: GameContext): void;

    getForward(): Vector {
        return this.forward;
    }

    getHash() {
        return this.hash;
    }

    getCollider(): CircleCollider {
        return this.collider;
    }

    abstract getCoords(): Coords;

    getColliderScale(): number {
        return 1;
    }

    protected handleLeavingScreenByWrappingAround(context: GameContext) {
        const pos = this.collider.getPosition();
        if (pos.x < 0) pos.x += context.settings.SCREEN_WIDTH;
        else if (pos.x >= context.settings.SCREEN_WIDTH)
            pos.x -= context.settings.SCREEN_WIDTH;
        if (pos.y < 0) pos.y += context.settings.SCREEN_HEIGHT;
        else if (pos.y >= context.settings.SCREEN_HEIGHT)
            pos.y -= context.settings.SCREEN_HEIGHT;
        this.collider.setPosition(pos);
    }
}
