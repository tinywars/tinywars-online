import { PlayerSettings } from "./player-settings";

export interface GameSettings {
    // Global settings
    SCREEN_WIDTH: number; // internal game resolution in pixels
    SCREEN_HEIGHT: number; // internal game resolution in pixels
    COMMON_ANIMATION_FPS: number;
    EFFECT_ANIMATION_FPS: number;
    TIME_TILL_RESTART: number; // seconds
    PLAYER_SETTINGS: PlayerSettings[];
    DISPLAY_PLAYER_NAMES: boolean; // whether to display player names during gameplay
    PRNG_SEED: number;
    FIXED_FRAME_TIME: number;
    // Spawn settings
    PLAYER_COUNT: number; // total number of ships, including NPCs
    NPC_COUNT: number;
    ROCK_COUNT: number;
    PLAYER_INITIAL_HEALTH: number;
    PLAYER_INITIAL_ENERGY: number;
    PLAYER_MAX_ENERGY: number;
    // AI Settings
    AI_DUMBNESS: number[]; // For each possible player, value from 0..1 where 0 is minimal dumbness and 1 is maximum dumbness
    AI_SHOOT_DELAY: number;
    AI_HEALTH_SCORE_WEIGHT: number; // how much it is priority to target weak players
    AI_HEALTH_POWERUP_SCORE_WEIGHT: number; // how much it is priority to target healing powerups
    AI_POWERUP_ACTIONABLE_RADIUS: number;
    AI_POWERUP_IGNORE_DELAY: number;
    AI_MAX_AIM_ERROR: number; // Maximal radial difference from aim angle, decreases with growing delay between shots
    AI_AIM_ERROR_DECREASE_SPEED: number;
    AI_MAX_COLLISION_DODGE_ERROR: number; // How long AI can wait (before it "notices the collison") before it starts evading
    AI_COLLISION_DODGE_ERROR_DECREASE_SPEED: number;
    AI_MAX_COLLISION_PANIC_RADIUS: number; // AI can "panic" when computing incoming collisions, by enlarging myPlayer radius by maximally this amount
    // Simulation settings
    //   Player
    PLAYER_FORWARD_SPEED: number;
    PLAYER_TURBO_FORWARD_SPEED: number;
    PLAYER_ROTATION_SPEED: number;
    PLAYER_ENERGY_RECHARGE_SPEED: number;
    PLAYER_MASS: number;
    //   Projectile
    PROJECTILE_SPEED: number;
    PROJECTILE_HARDEST_SPEED: number;
    PROJECTILE_MAX_COLLIDER_SCALE: number;
    PROJECTILE_DAMAGE: number;
    PROJECTILE_ENABLE_TELEPORT: boolean;
    PROJECTILE_MASS: number;
    PROJECTILE_SELF_DESTRUCT_TIMEOUT: number;
    //   Obstacle
    OBSTACLE_MAX_SPEED: number;
    OBSTACLE_HIT_DAMAGE: number;
    OBSTACLE_MASS: number;
    OBSTACLE_BOUNCE_SLOW_FACTOR: number; // how much of the obstacle forward vector is preserved after bounce
    //   Powerups
    POWERUP_MIN_SPAWN_DELAY: number;
    POWERUP_MAX_SPAWN_DELAY: number;
    POWERUP_SPAWN_CHANCE_DISTRIBUTION_SUM: number;
    POWERUP_SPAWN_CHANCE_DISTRIBUTION: number[];
    POWERUP_ROTATION_SPEED: number;
    //   Other settings
    TIME_UNTIL_DIFFICULTY_STARTS_RAMPING_UP: number;
    TIME_UNTIL_MAXIMUM_DIFFICULTY: number;
}
