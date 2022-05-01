import { CircleCollider } from "../utility/circle-collider";
import { Controller } from "../utility/controller";
import { Vector } from "../utility/vector";
import { clamp } from "../utility/math";
import { eventSpawnProjectile } from "../events/game-event";
import { KeyCode } from "../game/key-codes";
import { GameContext } from "./game-context";
import { GameObject } from "./game-object";
import { AnimationEngine, AnimationFrame } from "../utility/animation";
import { Coords } from "../utility/coords";

export class Player extends GameObject {
    protected static RADIUS = 16;
    
    protected direction: Vector = Vector.zero();
    protected forward: Vector = Vector.zero();
    protected speed = 0;
    protected health = 0;
    protected energy = 0;
    protected maxEnergy = 0;

    constructor(
        readonly id: number,
        private controller: Controller,
        private animationEngine: AnimationEngine
    ) {
        super();

        this.collider = new CircleCollider(
            Vector.outOfView(),
            Player.RADIUS
        );
        this.animationEngine.setState("idle", true);
    }

    spawn(options: {position: Vector, initialHealth: number, initialEnergy: number, maxEnergy: number}) {
        this.collider.setPosition(options.position);
        this.direction = new Vector(1, 0);
        this.forward = new Vector(0, 0);
        this.rotation = 0;

        this.health = options.initialHealth;
        this.energy = options.initialEnergy;
        this.maxEnergy = options.maxEnergy;
    }

    despawn() {
        this.collider.setPosition(Vector.outOfView());
    }

    update(dt: number, context: GameContext) {
        if (!this.animationEngine.update(dt)) {
            this.animationEngine.setState("idle", true);
        }

        let updateFwd = true;
        let rotation = 0;
        if (this.controller.isKeyPressed(KeyCode.Up)) {
            this.speed = context.PLAYER_FORWARD_SPEED;
        } else if (this.controller.isKeyPressed(KeyCode.Down)) {
            this.speed = -context.PLAYER_FORWARD_SPEED;
        } else updateFwd = false;

        if (this.controller.isKeyPressed(KeyCode.Left)) {
            rotation = -context.PLAYER_ROTATION_SPEED;
        } else if (this.controller.isKeyPressed(KeyCode.Right)) {
            rotation = context.PLAYER_ROTATION_SPEED;
        }

        this.handleShooting(dt, context);
        this.updateRotation(rotation, dt);
        this.moveForward(updateFwd, dt, context);
        this.rechargeEnergy(dt, context);
    }
    
    getCoords(): Coords {
        return {
            position: this.collider.getPosition().copy(),
            angle: this.rotation,
            frame: this.animationEngine.getCurrentFrame()
        };
    }

    hit(damage: number) {
        this.animationEngine.setState("hit");
        this.health -= damage;
        
        if (this.health < 0) {
            // TODO: destroy player
        }
    }

    getEnergy(): number {
        return this.energy;
    }

    getHealth(): number {
        return this.health;
    }

    private updateRotation(frameRotation: number, dt: number) {
        this.rotation += frameRotation * dt;
        if (this.rotation >= 360) this.rotation -= 360;
        else if (this.rotation < 0) this.rotation += 360;
        this.direction.setRotation(this.rotation);
    }

    private moveForward(updateForward: boolean, dt: number, context: GameContext) {
        if (updateForward)
            this.forward = this.direction.getScaled(this.speed);

        this.collider.move(this.forward.getScaled(dt));
        this.handleLeavingScreenByWrappingAround(context);     
    }

    private rechargeEnergy(dt: number, context: GameContext) {        
        // Locking this behind condition ensures we can make a powerup that will
        // add energy above native maxEnergy limit
        if (this.energy >= this.maxEnergy)
            return;

        this.energy = clamp(
            this.energy + context.PLAYER_ENERGY_RECHARGE_SPEED * dt, 
            0, 
            this.maxEnergy);
    }

    private handleShooting(dt: number, context: GameContext) {
        if (!this.controller.isKeyPressed(KeyCode.Shoot))
            return;
        
        this.controller.releaseKey(KeyCode.Shoot);

        if (this.energy < 1)
            return;

        context.eventQueue.add(
            eventSpawnProjectile({
                position: this.collider.getPosition().getSum(
                    // Spawn projectile right in front of the player so it doesn't collide with them
                    this.direction.getScaled(Player.RADIUS + this.forward.getScaled(dt).getSize())), 
                direction: this.direction, 
                damageMultiplier: 1}));
        this.energy--;
    }
}
