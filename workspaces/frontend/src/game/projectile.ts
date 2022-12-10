import { eventDestroyProjectile } from "../events/game-event";
import { AnimationEngine } from "../utility/animation";
import { CircleCollider } from "../utility/circle-collider";
import { Coords } from "../utility/coords";
import { lerp } from "../utility/math";
import { Vector } from "../utility/vector";
import { GameContext } from "./game-context";
import { GameObject } from "./game-object";

export type ProjectileAnimationKey = "idle"
export class Projectile extends GameObject {
    private damage = 0;
    private selfDestructTimeout = 0;
    private colliderScale = 1;

    constructor(
        readonly id: number,
        private animationEngine: AnimationEngine<ProjectileAnimationKey>,
    ) {
        super();
        // Collider is completely newly created in each spawn
        this.collider = new CircleCollider(Vector.outOfView(), 0);
        this.animationEngine.setState("idle", true);
    }

    update(dt: number, context: GameContext) {
        this.collider.move(this.forward.getScaled(dt));

        this.selfDestructTimeout -= dt;
        if (this.selfDestructTimeout <= 0)
            context.eventQueue.add(
                eventDestroyProjectile(this.id, Vector.zero()),
            );

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
        colliderSize: number;
        colliderScale: number;
    }) {
        this.colliderScale = options.colliderScale;
        this.collider = new CircleCollider(
            options.position,
            options.colliderSize,
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
            context.eventQueue.add(
                eventDestroyProjectile(this.id, Vector.zero()),
            );
        }
    }

    static getNewProjectileSpeed(
        difficultyFactor: number,
        context: GameContext,
    ): number {
        return lerp(
            context.settings.PROJECTILE_SPEED,
            context.settings.PROJECTILE_MAX_SPEED,
            difficultyFactor,
        );
    }

    static getNewProjectileColliderSize(
        difficultyFactor: number,
        context: GameContext,
    ): number {
        return lerp(
            context.settings.PROJECTILE_COLLIDER_SIZE,
            context.settings.PROJECTILE_MAX_COLLIDER_SIZE,
            difficultyFactor,
        );
    }
}
