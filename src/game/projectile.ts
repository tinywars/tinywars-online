import { eventDestroyProjectile } from "../events/game-event";
import { AnimationEngine } from "../utility/animation";
import { CircleCollider } from "../utility/circle-collider";
import { Coords } from "../utility/coords";
import { Vector } from "../utility/vector";
import { GameContext } from "./game-context";
import { GameObject } from "./game-object";

export class Projectile extends GameObject {
    private damage = 0;
    private selfDestructTimeout = 0;
    BASE_COLLIDER_SIZE = 2;
    private colliderScale = 1;

    constructor(
        readonly id: number,
        private animationEngine: AnimationEngine<any>,
    ) {
        super();
        this.collider = new CircleCollider(
            Vector.outOfView(),
            this.BASE_COLLIDER_SIZE,
        );
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
        colliderScale: number;
    }) {
        this.colliderScale =
            this.BASE_COLLIDER_SIZE /* +
                this.BASE_COLLIDER_SIZE * this.colliderScale*/ /
            this.BASE_COLLIDER_SIZE;
        this.collider = new CircleCollider(
            options.position,
            this.BASE_COLLIDER_SIZE * this.colliderScale,
        );
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

    override getColliderScale(): number {
        return this.colliderScale;
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
