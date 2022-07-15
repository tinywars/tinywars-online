import { eventDestroyEffect } from "../events/game-event";
import { AnimationEngine } from "../utility/animation";
import { Coords } from "../utility/coords";
import { Vector } from "../utility/vector";
import { GameContext } from "./game-context";
import { GameObject } from "./game-object";

export enum EffectType {
    PlayerExplosion,
    ProjectileExplosion,
    PowerupPickup,
}

export class Effect extends GameObject {
    constructor(
        readonly id: number,
        private animationEngine: AnimationEngine<any>,
        private effectTypeToAnimationName: (t: EffectType) => string,
    ) {
        super();
    }

    spawn(options: { position: Vector; rotation: number; type: EffectType }) {
        this.collider.setPosition(options.position);
        this.rotation = options.rotation;
        this.animationEngine.setState(
            this.effectTypeToAnimationName(options.type),
            false,
            true,
        );
    }

    update(dt: number, context: GameContext): void {
        if (!this.animationEngine.update(dt)) {
            context.eventQueue.add(eventDestroyEffect(this.id));
        }
    }

    getCoords(): Coords {
        return {
            position: this.collider.getPosition().copy(),
            angle: this.rotation,
            frame: this.animationEngine.getCurrentFrame(),
        };
    }
}
