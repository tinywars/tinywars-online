import { GameSettings } from "../game/game-settings";

export function getMockSettings(): GameSettings {
    return {
        SCREEN_WIDTH: 1000,
        SCREEN_HEIGHT: 1000,
        COMMON_ANIMATION_FPS: 2,
        EFFECT_ANIMATION_FPS: 16;
        TIME_TILL_RESTART: 5,
        PLAYER_SETTINGS: [],
        DISPLAY_PLAYER_NAMES: true,
        PRNG_SEED: 0,
        FIXED_FRAME_TIME: 1 / 60,
        // Spawn settings
        PLAYER_COUNT: 4,
        NPC_COUNT: 0,
        ROCK_COUNT: 4,
        PLAYER_INITIAL_HEALTH: 3,
        PLAYER_INITIAL_ENERGY: 2,
        PLAYER_MAX_ENERGY: 4,
        // AI Settings
        AI_DUMBNESS: [0, 0.33, 0.66, 1],
        AI_SHOOT_DELAY: 0.2,
        AI_HEALTH_SCORE_WEIGHT: 100,
        AI_HEALTH_POWERUP_SCORE_WEIGHT: 150,
        AI_POWERUP_ACTIONABLE_RADIUS: 400,
        AI_POWERUP_IGNORE_DELAY: 0.85,
        AI_MAX_AIM_ERROR: 25,
        AI_AIM_ERROR_DECREASE_SPEED: 0.25,
        AI_MAX_COLLISION_DODGE_ERROR: 0.75,
        AI_COLLISION_DODGE_ERROR_DECREASE_SPEED: 0.33,
        AI_MAX_COLLISION_PANIC_RADIUS: 20,
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
        //   Powerup
        POWERUP_MIN_SPAWN_DELAY: 5,
        POWERUP_MAX_SPAWN_DELAY: 10,
        POWERUP_SPAWN_CHANCE_DISTRIBUTION: [2, 5, 7],
        POWERUP_SPAWN_CHANCE_DISTRIBUTION_SUM: 7,
        POWERUP_ROTATION_SPEED: 64,
    };
}
