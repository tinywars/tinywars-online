import { GameSettings } from "../game/game-settings";

export function getMockSettings(): GameSettings {
    return {
        SCREEN_WIDTH: 1000,
        SCREEN_HEIGHT: 1000,
        ANIMATION_FPS: 2,
        TIME_TILL_RESTART: 5,
        PLAYER_SETTINGS: [],
        DISPLAY_PLAYER_NAMES: true,
        PRNG_SEED: 0,
        // Spawn settings
        PLAYER_COUNT: 4,
        NPC_COUNT: 0,
        ROCK_COUNT: 4,
        PLAYER_INITIAL_HEALTH: 3,
        PLAYER_INITIAL_ENERGY: 2,
        PLAYER_MAX_ENERGY: 4,
        // AI Settings
        AI_MAX_SHOOT_DELAY: 1.5,
        AI_MIN_SHOOT_DELAY: 0.5,
        // Simulation settings
        //   Player
        PLAYER_FORWARD_SPEED: 250,
        PLAYER_TURBO_FORWARD_SPEED: 400,
        PLAYER_ROTATION_SPEED: 250,
        PLAYER_ENERGY_RECHARGE_SPEED: 0.5,
        PLAYER_MASS: 10,
        //   Projectile
        PROJECTILE_SPEED: 500,
        PROJECTILE_DAMAGE: 1,
        PROJECTILE_ENABLE_TELEPORT: false,
        PROJECTILE_MASS: 5,
        PROJECTILE_SELF_DESTRUCT_TIMEOUT: 6,
        //   Obstacle
        OBSTACLE_MAX_SPEED: 375,
        OBSTACLE_HIT_DAMAGE: 10,
        OBSTACLE_MASS: 15,
        OBSTACLE_BOUNCE_SLOW_FACTOR: 0.8,
    };
}
