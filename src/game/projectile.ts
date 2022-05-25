import { CircleCollider } from "../utility/circle-collider";
import { Vector } from "../utility/vector";
import { GameObject } from "./game-object";
import { GameContext } from "./game-context";
import { eventDestroyProjectile } from "../events/game-event";
import { AnimationEngine } from "../utility/animation";
import { Coords } from "../utility/coords";

export class Projectile extends GameObject {
    private damage = 0;
    private selfDestructTimeout = 0;

    constructor(
        readonly id: number,
        private animationEngine: AnimationEngine<any>,
    ) {
        super();
        this.collider = new CircleCollider(Vector.outOfView(), 2);
        this.animationEngine.setState("idle", true);
    }

    update(dt: number, context: GameContext) {
        this.collider.move(this.forward.getScaled(dt));

        this.selfDestructTimeout -= dt;
        if (this.selfDestructTimeout <= 0)
            context.eventQueue.add(eventDestroyProjectile(this.id));

        if (context.settings.PROJECTILE_ENABLE_TELEPORT) {
            this.handleLeavingScreenByWrappingAround(context);
        } else {
            this.handleLeavingScreen(context);
        }
    }

    spawn(options: {
        position: Vector;
        forward: Vector;
        damage: number;
        selfDestructTimeout: number;
    }) {
        this.collider.setPosition(options.position);
        this.forward = options.forward;
        this.damage = options.damage;
        this.rotation = this.forward.toAngle();
        this.selfDestructTimeout = options.selfDestructTimeout;
    }

    despawn() {
        this.collider.setPosition(Vector.outOfView());
    }

    getCoords(): Coords {
        return {
            position: this.collider.getPosition().copy(),
            angle: this.rotation,
            frame: this.animationEngine.getCurrentFrame(),
        };
    }
    getDamage(): number {
        return this.damage;
    }

    private handleLeavingScreen(context: GameContext) {
        const pos = this.collider.getPosition();
        if (
            pos.x < 0 ||
            pos.x > context.settings.SCREEN_WIDTH ||
            pos.y < 0 ||
            pos.y > context.settings.SCREEN_HEIGHT
        ) {
            context.eventQueue.add(eventDestroyProjectile(this.id));
        }
    }
}
