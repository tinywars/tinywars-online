import { AnimationEngine } from "../utility/animation";
import { CircleCollider } from "../utility/circle-collider";
import { Vector } from "../utility/vector";
import { GameContext } from "./game-context";
import { GameObject } from "./game-object";
import { Coords } from "../utility/coords";

export class Obstacle extends GameObject {
    protected static RADIUS = 20;

    private forward: Vector;

    constructor(
        readonly id: number,
        private animationEngine: AnimationEngine,
    ) {
        super();
        this.collider = new CircleCollider(
            Vector.outOfView(),
            Obstacle.RADIUS);
        this.forward = Vector.zero();
        this.animationEngine.setState("idle" + id % 2, true);
    }

    update(dt: number, context: GameContext) {
        this.forward.limit(context.OBSTACLE_MAX_SPEED);
        this.collider.move(this.forward.getScaled(dt));

        context.obstacles.forEach((obstacle) => {
            if (this.id === obstacle.id)
                return;

            if (this.collider.collidesWith(obstacle.getCollider())) {
                // Exchange their movement vector
                const tmp = this.forward.getScaled(0.8);
                this.forward = obstacle.forward.getScaled(0.8);
                obstacle.forward = tmp;

                // nudge them apart from each other so they won't become stuck
                const diff = Vector.diff(this.collider.getPosition(), obstacle.collider.getPosition()).getUnit();
                this.collider.move(diff);
                obstacle.collider.move(diff.getInverted());
            }
        });

        this.handleLeavingScreenByWrappingAround(context);
    }

    spawn(options: {
        position: Vector,
        forward: Vector
        playerIndex: number}) 
    {
        this.collider.setPosition(options.position);
        this.forward = options.forward;

        if (options.playerIndex > -1) {
            // TODO: this is a wreck and not a rock
            // use different animation
        }
    }

    hit(force: Vector) {
        this.forward.add(force);
        // TODO: play sound
    }
    
    getCoords(): Coords {
        return {
            position: this.collider.getPosition().copy(),
            angle: this.rotation,
            frame: this.animationEngine.getCurrentFrame()
        };
    }
}