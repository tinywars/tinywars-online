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
