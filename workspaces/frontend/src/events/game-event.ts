import { EffectType } from "../game/effect";
import { GameContext } from "../game/game-context";
import { PowerupType } from "../game/powerup";
import { Projectile } from "../game/projectile";
import { getDifficultyFactorFromElapsedTime } from "../utility/math";
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

            const difficultyFactor = getDifficultyFactorFromElapsedTime(
                context.duration,
                context.settings.TIME_UNTIL_DIFFICULTY_STARTS_RAMPING_UP,
                context.settings.TIME_UNTIL_MAXIMUM_DIFFICULTY,
            );

            const projectileSpeed = Projectile.getNewProjectileSpeed(
                difficultyFactor,
                context,
            );

            const projectileColliderSize =
                Projectile.getNewProjectileColliderSize(
                    difficultyFactor,
                    context,
                );

            context.eventEmitter.emit("ProjectileSpawned", options.playerId);
            context.projectiles.getLastItem().spawn({
                position: options.position,
                forward: options.direction.getScaled(projectileSpeed),
                damage:
                    options.damageMultiplier *
                    context.settings.PROJECTILE_DAMAGE,
                selfDestructTimeout:
                    context.settings.PROJECTILE_SELF_DESTRUCT_TIMEOUT,
                colliderSize: projectileColliderSize,
                colliderScale:
                    projectileColliderSize /
                    context.settings.PROJECTILE_COLLIDER_SIZE,
            });
        },
    };
    return e;
}

export function eventDestroyProjectile(
    index: number,
    explosionForwardSpeed: Vector,
) {
    const e: GameEvent = {
        name: "DestroyProjectileEvent",
        process: (context: GameContext): void => {
            context.projectiles.forEach((p, i) => {
                if (p.id !== index) return;

                const coords = context.projectiles.getItem(i).getCoords();
                context.eventQueue.add(
                    eventCreateEffect({
                        position: coords.position,
                        rotation: coords.angle,
                        type: EffectType.ProjectileExplosion,
                        forward: explosionForwardSpeed,
                        scale: context.projectiles
                            .getItem(i)
                            .getColliderScale(),
                    }),
                );

                context.projectiles.getItem(i).despawn();
                context.projectiles.popItem(i);
            });
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

            context.players.forEach((p) => {
                context.scores[p.id]++;
            });
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

            context.eventQueue.add(
                eventCreateEffect({
                    position: options.position,
                    rotation: 0,
                    type: EffectType.PlayerExplosion,
                    forward: options.forward,
                }),
            );
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

                context.eventQueue.add(
                    eventCreateEffect({
                        position: context.powerups.getItem(i).getCoords()
                            .position,
                        rotation: 0,
                        type: EffectType.PowerupPickup,
                        forward: Vector.zero(),
                    }),
                );

                context.powerups.getItem(i).despawn();
                context.powerups.popItem(i);
            });
        },
    };
    return e;
}

export function eventCreateEffect(options: {
    position: Vector;
    rotation: number;
    type: EffectType;
    forward: Vector;
    scale?: number;
}) {
    const e: GameEvent = {
        name: "CreateEffectEvent",
        process: (context: GameContext): void => {
            if (!context.effects.grow()) return;

            context.effects.getLastItem().spawn({
                position: options.position,
                rotation: options.rotation,
                type: options.type,
                forward: options.forward,
                scale: options.scale,
            });
        },
    };
    return e;
}

export function eventDestroyEffect(index: number) {
    const e: GameEvent = {
        name: "DestroyEffectEvent",
        process: (context: GameContext): void => {
            context.effects.forEach((e, i) => {
                if (e.id !== index) return;

                context.effects.popItem(i);
            });
        },
    };
    return e;
}
