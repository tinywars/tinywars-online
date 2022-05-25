import { AnimationEngine } from "../utility/animation";
import { CircleCollider } from "../utility/circle-collider";
import { Vector } from "../utility/vector";
import { GameContext } from "./game-context";
import { GameObject } from "./game-object";
import { Coords } from "../utility/coords";
import { sanitizeAngle } from "../utility/math";

export class Obstacle extends GameObject {
    protected static RADIUS = 20;

    constructor(
        readonly id: number,
        private animationEngine: AnimationEngine<any>,
    ) {
        super();
        this.collider = new CircleCollider(Vector.outOfView(), Obstacle.RADIUS);
        this.forward = Vector.zero();
        this.animationEngine.setState("idle" + (id % 2), true);
    }

    update(dt: number, context: GameContext) {
        this.forward.limit(context.settings.OBSTACLE_MAX_SPEED);
        this.collider.move(this.forward.getScaled(dt));
        this.rotation = sanitizeAngle(
            this.rotation +
                this.forward.getSize() * dt * (this.id % 2 ? -1 : 1),
        );

        this.handleLeavingScreenByWrappingAround(context);
    }

    spawn(options: { position: Vector; forward: Vector; playerIndex: number }) {
        this.collider.setPosition(options.position);
        this.forward = options.forward;

        if (options.playerIndex > -1) {
            this.animationEngine.setState("wreck" + options.playerIndex);
        }
    }

    hit(force: Vector) {
        this.forward.add(force);
        // TODO: play sound
    }

    setForward(fwd: Vector) {
        this.forward = fwd;
    }

    getCoords(): Coords {
        return {
            position: this.collider.getPosition().copy(),
            angle: this.rotation,
            frame: this.animationEngine.getCurrentFrame(),
        };
    }
}
