import { Vector } from "../utility/vector";
import { GameObject } from "./game-object";
import { GameContext } from "./game-context";
import { eventDestroyProjectile } from "../events/game-event";
import { CircleCollider } from "../utility/circle-collider";

export class Projectile extends GameObject {
    private forward: Vector = Vector.zero();
    private damage = 0;

    constructor(
        private id: number)
    {
        super();
        this.collider = new CircleCollider(
            Vector.outOfView(), 2
        );
    }

    update(dt: number, context: GameContext) {
        this.collider.move(this.forward.getScaled(dt));

        const pos = this.collider.getPosition();
        if (pos.x < 0
            || pos.x > context.SCREEN_WIDTH
            || pos.y < 0
            || pos.y > context.SCREEN_HEIGHT)
        {
            context.eventQueue.add(
                eventDestroyProjectile(this.id)
            );
        }
    }

    getId(): number {
        return this.id;
    }

    spawn(position: Vector, forward: Vector, damage: number) {
        this.collider.setPosition(position);
        this.forward = forward;
        this.damage = damage;
        this.rotation = forward.toAngle();
    }

    despawn() {
        this.collider.setPosition(Vector.outOfView());
    }
}