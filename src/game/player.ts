import { CircleCollider } from "../utility/circle-collider";
import { Controller } from "../utility/controller";
import { Vector } from "../utility/vector";
import { clamp, sanitizeAngle } from "../utility/math";
import {
    eventSpawnProjectile,
    eventDestroyPlayer,
    eventSpawnWreck,
} from "../events/game-event";
import { GameContext } from "./game-context";
import { GameObject } from "./game-object";
import { AnimationEngine } from "../utility/animation";
import { Coords } from "../utility/coords";
import { EventQueue } from "../events/event-queue";

export class Player extends GameObject {
    protected static RADIUS = 10;
    protected direction: Vector = Vector.zero();
    protected health = 0;
    protected energy = 0;
    protected maxEnergy = 0;

    constructor(
        readonly id: number,
        private controller: Controller,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private animationEngine: AnimationEngine<any>,
        private eventQueue: EventQueue,
    ) {
        super();

        this.collider = new CircleCollider(Vector.outOfView(), Player.RADIUS);
    }

    spawn(options: {
        position: Vector;
        initialHealth: number;
        initialEnergy: number;
        maxEnergy: number;
    }) {
        this.collider.setPosition(options.position);
        this.direction = new Vector(1, 0);
        this.forward = new Vector(0, 0);
        this.rotation = 0;

        this.health = options.initialHealth;
        this.energy = options.initialEnergy;
        this.maxEnergy = options.maxEnergy;

        this.animationEngine.setState("idle", true);
    }

    despawn() {
        this.collider.setPosition(Vector.outOfView());
    }

    update(dt: number, context: GameContext) {
        if (!this.animationEngine.update(dt)) {
            this.animationEngine.setState("idle", true);
        }

        let { throttle, steer } = this.controller.getThrottleAndSteer();
        throttle *= context.settings.PLAYER_FORWARD_SPEED;
        steer *= context.settings.PLAYER_ROTATION_SPEED;

        this.handleShooting(dt);
        this.handleAction(context);
        this.updateRotation(steer, dt);
        this.moveForward(throttle, dt, context);
        this.rechargeEnergy(dt, context);

        context.obstacles.forEach((obstacle) => {
            if (this.collider.collidesWith(obstacle.getCollider())) {
                this.hit(context.settings.OBSTACLE_HIT_DAMAGE);
                obstacle.hit(
                    this.forward.getScaled(
                        context.settings.PLAYER_MASS /
                            context.settings.OBSTACLE_MASS,
                    ),
                );
                this.forward = this.forward.getScaled(0.1);
            }
        });
    }

    getCoords(): Coords {
        return {
            position: this.collider.getPosition().copy(),
            angle: this.rotation,
            frame: this.animationEngine.getCurrentFrame(),
        };
    }

    hit(damage: number) {
        this.animationEngine.setState("hit");
        this.health -= damage;

        if (this.health <= 0) {
            this.eventQueue.add(eventDestroyPlayer(this.id));

            this.eventQueue.add(
                eventSpawnWreck({
                    position: this.collider.getPosition(),
                    forward: this.forward.getScaled(0.4),
                    index: this.id,
                }),
            );
        }
    }

    getEnergy(): number {
        return this.energy;
    }

    getHealth(): number {
        return this.health;
    }

    private updateRotation(frameRotation: number, dt: number) {
        this.rotation = sanitizeAngle(this.rotation + frameRotation * dt);
        this.direction.setRotation(this.rotation);
    }

    private moveForward(throttle: number, dt: number, context: GameContext) {
        if (throttle != 0) this.forward = this.direction.getScaled(throttle);

        this.collider.move(this.forward.getScaled(dt));
        this.handleLeavingScreenByWrappingAround(context);
    }

    private rechargeEnergy(dt: number, context: GameContext) {
        // Locking this behind condition ensures we can make a powerup that will
        // add energy above native maxEnergy limit
        if (this.energy >= this.maxEnergy) return;

        this.energy = clamp(
            this.energy + context.settings.PLAYER_ENERGY_RECHARGE_SPEED * dt,
            0,
            this.maxEnergy,
        );
    }

    private handleShooting(dt: number) {
        if (!this.controller.readAttackToggled()) return;

        if (this.energy < 1) return;

        this.eventQueue.add(
            eventSpawnProjectile({
                position: this.collider.getPosition().getSum(
                    // Spawn projectile right in front of the player so it doesn't collide with them
                    this.direction.getScaled(
                        Player.RADIUS + this.forward.getScaled(dt).getSize(),
                    ),
                ),
                direction: this.direction,
                damageMultiplier: 1,
            }),
        );
        this.energy--;
    }

    private handleAction(context: GameContext) {
        if (!this.controller.readActionToggled()) return;
        if (this.energy < 1) return;

        /*
        NOTE: Once we have implemeted powerups, we can give player
        a new property to hold currently equipped powerup, a setter
        for it and then this method would select between behaviours
        based on active power.
        */

        this.forward = this.forward
            .getUnit()
            .getScaled(context.settings.PLAYER_TURBO_FORWARD_SPEED);
        this.energy--;
    }
}
