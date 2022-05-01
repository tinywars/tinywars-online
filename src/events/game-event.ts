import { GameContext } from "../game/game-context";
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

export function eventSpawnProjectile(options: { position: Vector, direction: Vector, damageMultiplier: number }) {
    const e: GameEvent = {
        process: (context: GameContext): void => {
            if (!context.projectiles.grow())
                return;
            
            context.projectiles.getLastItem().spawn({
                position: options.position,
                forward: options.direction.getScaled(context.PROJECTILE_SPEED),
                damage: options.damageMultiplier * context.PROJECTILE_DAMAGE
            });
        }
    };
    return e;
}

export function eventDestroyProjectile(index: number) {
    const e: GameEvent = {
        process: (context: GameContext): void => {
            // TODO: play destruction animation and/or sound
            for (let i = 0; i < context.projectiles.getSize(); i++) {
                if (context.projectiles.getItem(i).id === index) {
                    context.projectiles.getItem(i).despawn();
                    context.projectiles.popItem(i);
                }
            }
        }
    };
    
    return e;
}

export function eventDestroyPlayer(index: number) {
    const e: GameEvent = {
        process: (context: GameContext): void => {
            context.players.forEach((p, i) => {
                if (p.id !== index)
                    return;

                context.players.getItem(i).despawn();
                context.players.popItem(i);
            });
        }
    };
    return e;
}

export function eventSpawnWreck(options: {
    index: number,
    position: Vector,
    forward: Vector})
{
    const e: GameEvent = {
        process: (context: GameContext): void => {
            if (!context.obstacles.grow())
                return;
            
            context.obstacles.getLastItem().spawn({
                position: options.position, 
                forward: options.forward,
                playerIndex: options.index});
        }
    };
    return e;
}