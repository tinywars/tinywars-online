import { EventQueue } from "../events/event-queue";
import { Player } from "./player";
import { FastArray } from "../utility/fast-array";
import { Projectile } from "./projectile";

export interface GameContext {
    SCREEN_WIDTH: number;
    SCREEN_HEIGHT: number;
    PLAYER_FORWARD_SPEED: number; // px per second
    PLAYER_ROTATION_SPEED: number; // degrees per second
    PLAYER_ENERGY_RECHARGE_SPEED: number; // chunk per second
    PROJECTILE_SPEED: number;
    PROJECTILE_DAMAGE: number;
    PROJECTILE_ENABLE_TELEPORT: boolean; // if true then projectiles wrap around screen and are not destroyed when leaving it

    players: FastArray<Player>;
    projectiles: FastArray<Projectile>;
    // rocks...
    // wrecks...
    // etc...
    eventQueue: EventQueue;
    log: (msg: string) => void;
    generateId: () => number;
}
