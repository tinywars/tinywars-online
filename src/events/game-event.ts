import { GameContext } from "../game/game-context";
import { PowerupType } from "../game/powerup";
import { PRNG } from "../utility/prng";
import { Vector } from "../utility/vector";

export interface GameEvent {
    /**
     * Each event only need a process method which
     * gets whole game scene context passed in a parameter.
     * All custom parameters are embedded into the
     * callback by the factory method
     */
    process: (context: GameContext) => void;
    // For testing purposes
    name: string;
}

/**
 * Example of game event. This one only performs logging
 * @param message Message to be logged
 * @returns Instance of GameEvent
 */
export function eventDebug(message: string) {
    const e: GameEvent = {
        name: "DebugEvent",
        process: (context: GameContext): void => {
            context.log("DebugEvent: " + message);
        },
    };
    return e;
}

export function eventSpawnProjectile(options: {
    position: Vector;
    direction: Vector;
    damageMultiplier: number;
    playerId: number;
}) {
    const e: GameEvent = {
        name: "SpawnProjectileEvent",
        process: (context: GameContext): void => {
            if (!context.projectiles.grow()) return;

            context.eventEmitter.emit("ProjectileSpawned", options.playerId);
            context.projectiles.getLastItem().spawn({
                position: options.position,
                forward: options.direction.getScaled(
                    context.settings.PROJECTILE_SPEED,
                ),
                damage:
                    options.damageMultiplier *
                    context.settings.PROJECTILE_DAMAGE,
                selfDestructTimeout:
                    context.settings.PROJECTILE_SELF_DESTRUCT_TIMEOUT,
            });
        },
    };
    return e;
}

export function eventDestroyProjectile(index: number) {
    const e: GameEvent = {
        name: "DestroyProjectileEvent",
        process: (context: GameContext): void => {
            // TODO: play destruction animation and/or sound
            for (let i = 0; i < context.projectiles.getSize(); i++) {
                if (context.projectiles.getItem(i).id === index) {
                    context.projectiles.getItem(i).despawn();
                    context.projectiles.popItem(i);
                }
            }
        },
    };

    return e;
}

export function eventDestroyPlayer(index: number) {
    const e: GameEvent = {
        name: "DestroyPlayerEvent",
        process: (context: GameContext): void => {
            context.players.forEach((p, i) => {
                if (p.id !== index) return;

                context.players.getItem(i).despawn();
                context.players.popItem(i);
            });
            context.eventEmitter.emit("PlayerWasDestroyed");
        },
    };
    return e;
}

export function eventSpawnWreck(options: {
    index: number;
    position: Vector;
    forward: Vector;
}) {
    const e: GameEvent = {
        name: "SpawnWreckEvent",
        process: (context: GameContext): void => {
            if (!context.obstacles.grow()) return;

            context.obstacles.getLastItem().spawn({
                position: options.position,
                forward: options.forward,
                playerIndex: options.index,
            });
        },
    };
    return e;
}

export function eventSpawnPowerup() {
    const e: GameEvent = {
        name: "SpawnPowerupEvent",
        process: (context: GameContext): void => {
            if (!context.powerups.grow()) return;

            const r =
                PRNG.randomInt() %
                context.settings.POWERUP_SPAWN_CHANCE_DISTRIBUTION_SUM;
            const type =
                context.settings.POWERUP_SPAWN_CHANCE_DISTRIBUTION.findIndex(
                    (value): boolean => {
                        return r < value;
                    },
                );
            console.log(`${r} -> ${type}`);

            context.powerups.getLastItem().spawn({
                position: new Vector(
                    PRNG.randomInt() % context.settings.SCREEN_WIDTH,
                    PRNG.randomInt() % context.settings.SCREEN_HEIGHT,
                ),
                type: type as PowerupType,
            });
        },
    };
    return e;
}

export function eventDestroyPowerup(index: number) {
    const e: GameEvent = {
        name: "DestroyPowerupEvent",
        process: (context: GameContext): void => {
            context.powerups.forEach((p, i) => {
                if (p.id !== index) return;

                context.powerups.getItem(i).despawn();
                context.powerups.popItem(i);
            });
        },
    };
    return e;
}
