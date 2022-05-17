import { PlayerSettings } from "./player-settings";

export interface GameSettings {
    // Global settings
    SCREEN_WIDTH: number; // internal game resolution in pixels
    SCREEN_HEIGHT: number; // internal game resolution in pixels
    ANIMATION_FPS: number;
    TIME_TILL_RESTART: number; // seconds
    PLAYER_SETTINGS: PlayerSettings[];
    DISPLAY_PLAYER_NAMES: boolean; // whether to display player names during gameplay
    PRNG_SEED: number;
    // Spawn settings
    PLAYER_COUNT: number; // total number of ships, including NPCs
    NPC_COUNT: number;
    ROCK_COUNT: number;
    PLAYER_INITIAL_HEALTH: number;
    PLAYER_INITIAL_ENERGY: number;
    PLAYER_MAX_ENERGY: number;
    // AI Settings
    AI_MAX_SHOOT_DELAY: number;
    AI_MIN_SHOOT_DELAY: number;
    // Simulation settings
    //   Player
    PLAYER_FORWARD_SPEED: number;
    PLAYER_TURBO_FORWARD_SPEED: number;
    PLAYER_ROTATION_SPEED: number;
    PLAYER_ENERGY_RECHARGE_SPEED: number;
    PLAYER_MASS: number;
    //   Projectile
    PROJECTILE_SPEED: number;
    PROJECTILE_DAMAGE: number;
    PROJECTILE_ENABLE_TELEPORT: boolean;
    PROJECTILE_MASS: number;
    PROJECTILE_SELF_DESTRUCT_TIMEOUT: number;
    //   Obstacle
    OBSTACLE_MAX_SPEED: number;
    OBSTACLE_HIT_DAMAGE: number;
    OBSTACLE_MASS: number;
}

export function getDefaultSettings(): GameSettings {
    return {
        SCREEN_WIDTH: 1000,
        SCREEN_HEIGHT: 1000,
        ANIMATION_FPS: 2,
        TIME_TILL_RESTART: 5,
        PLAYER_SETTINGS: [
            { name: "red", invertSteeringOnReverse: false },
            { name: "green", invertSteeringOnReverse: false },
            { name: "blue", invertSteeringOnReverse: false },
            { name: "yellow", invertSteeringOnReverse: false },
        ],
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
    };
}
