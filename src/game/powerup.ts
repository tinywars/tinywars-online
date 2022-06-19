import { AnimationEngine } from "../utility/animation";
import { CircleCollider } from "../utility/circle-collider";
import { Coords } from "../utility/coords";
import { Vector } from "../utility/vector";
import { GameContext } from "./game-context";
import { GameObject } from "./game-object";

export enum PowerupType {
    Heal = 0,
    Energy = 1,
    DoubleEnergy = 2,
    // others
}

export class Powerup extends GameObject {
    protected static RADIUS = 12;
    private type: PowerupType;

    constructor(
        readonly id: number,
        private animationEngine: AnimationEngine<any>,
    ) {
        super();
        this.collider = new CircleCollider(Vector.outOfView(), Powerup.RADIUS);
        this.type = PowerupType.Heal;
    }

    update(dt: number, context: GameContext): void {
        this.animationEngine.update(dt);
        this.rotation += context.settings.POWERUP_ROTATION_SPEED * dt;
    }

    spawn(options: { position: Vector; type: PowerupType }) {
        this.collider.setPosition(options.position);
        this.type = options.type;
        this.animationEngine.setState("idle" + this.type, true);
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

    getType(): PowerupType {
        return this.type;
    }
}
