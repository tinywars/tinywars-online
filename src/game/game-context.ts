import { EventQueue } from "../events/event-queue";
import { Player } from "./player";
import { FastArray } from "../utility/fast-array";
import { Projectile } from "./projectile";
import { Obstacle } from "./obstacle";

export interface GameContext {
    SCREEN_WIDTH: number;
    SCREEN_HEIGHT: number;
    // Player contants
    PLAYER_FORWARD_SPEED: number; // px per second
    PLAYER_ROTATION_SPEED: number; // degrees per second
    PLAYER_ENERGY_RECHARGE_SPEED: number; // chunk per second
    PLAYER_MASS: number;
    // Projectile constants
    PROJECTILE_SPEED: number;
    PROJECTILE_DAMAGE: number;
    PROJECTILE_ENABLE_TELEPORT: boolean; // if true then projectiles wrap around screen and are not destroyed when leaving it
    PROJECTILE_MASS: number;
    // Obstacle constants
    OBSTACLE_MAX_SPEED: number;
    OBSTACLE_HIT_DAMAGE: number;
    OBSTACLE_MASS: number;

    players: FastArray<Player>;
    projectiles: FastArray<Projectile>;
    obstacles: FastArray<Obstacle>;
    // rocks...
    // wrecks...
    // etc...
    eventQueue: EventQueue;
    log: (msg: string) => void;
    generateId: () => number;
}
