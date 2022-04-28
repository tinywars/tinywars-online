import { GameContext } from "../game/game-context";
import { Projectile } from "../game/projectile";
import { Vector } from "../utility/vector";

export interface GameEvent {
    /**
     * Each event only need a process method which
     * gets whole game scene context passed in a parameter.
     * All custom parameters are embedded into the
     * callback by the factory method
     */
    process: (context: GameContext) => void;
}

/**
 * Example of game event. This one only performs logging
 * @param message Message to be logged
 * @returns Instance of GameEvent
 */
export function eventDebug(message: string) {
    const e: GameEvent = {
        process: (context: GameContext): void => {
            context.log("DebugEvent: " + message);
        }
    };
    return e;
}

export function eventSpawnProjectile(position: Vector, direction: Vector, damage: number) {
    const e: GameEvent = {
        process: (context: GameContext): void => {
            if (!context.projectiles.grow())
                return;
            
            context.projectiles.getLastItem().spawn(
                position,
                direction.getScaled(context.PROJECTILE_SPEED),
                damage
            );
        }
    };
    return e;
}

export function eventDestroyProjectile(index: number) {
    const e: GameEvent = {
        process: (context: GameContext): void => {
            for (let i = 0; i < context.projectiles.getSize(); i++) {
                if (context.projectiles.getItem(i).getId() === index) {
                    context.projectiles.getItem(i).despawn();
                    context.projectiles.popItem(i);
                }
            }
        }
    };
    
    return e;
}