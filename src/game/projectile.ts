import { Vector } from "../utility/vector";
import { GameObject } from "./game-object";
import { GameContext } from "./game-context";
import { DestroyProjectile } from "../events/game-event";

export class Projectile extends GameObject {
    constructor(
        private id: number, 
        position: Vector, 
        direction: Vector, 
        private damage: number)
    {
        super();
        this.position = position;
        this.direction = direction;
    }

    update(dt: number, context: GameContext) {
        this.position.add(this.direction.getScaled(dt));

        if (this.position.x < 0
            || this.position.x > context.SCREEN_WIDTH
            || this.position.y < 0
            || this.position.y > context.SCREEN_HEIGHT)
        {
            context.eventQueue.add(
                DestroyProjectile(this.id)
            );
        }
    }

    getId(): number {
        return this.id;
    }
}