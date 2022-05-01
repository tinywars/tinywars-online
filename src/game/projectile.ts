import { CircleCollider } from "../utility/circle-collider";
import { Vector } from "../utility/vector";
import { GameObject } from "./game-object";
import { GameContext } from "./game-context";
import { eventDestroyProjectile } from "../events/game-event";

export class Projectile extends GameObject {
    private forward: Vector = Vector.zero();
    private damage = 0;

    constructor(
        readonly id: number)
    {
        super();
        this.collider = new CircleCollider(
            Vector.outOfView(), 2
        );
    }

    update(dt: number, context: GameContext) {
        this.collider.move(this.forward.getScaled(dt));

        let destroyThis = false;
        context.players.forEach((player) => {
            if (this.collider.collidesWith(player.getCollider())) {
                player.hit(this.damage);
                destroyThis = true;
            }
        });

        context.obstacles.forEach((obstacle) => {
            if (this.collider.collidesWith(obstacle.getCollider())) {
                // transferred forward momentum is small because projectiles have
                // almost no mass
                obstacle.hit(this.forward.getScaled(
                    context.PROJECTILE_MASS / context.OBSTACLE_MASS));
                destroyThis = true;
            }
        });

        if (destroyThis) {
            context.eventQueue.add(
                eventDestroyProjectile(this.id));
        }

        if (context.PROJECTILE_ENABLE_TELEPORT) {
            this.handleLeavingScreenByWrappingAround(context);
        }
        else {
            this.handleLeavingScreen(context);
        }
    }

    spawn(options: { position: Vector, forward: Vector, damage: number}) {
        this.collider.setPosition(options.position);
        this.forward = options.forward;
        this.damage = options.damage;
        this.rotation = this.forward.toAngle();
    }

    despawn() {
        this.collider.setPosition(Vector.outOfView());
    }

    private handleLeavingScreen(context: GameContext) {
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
}