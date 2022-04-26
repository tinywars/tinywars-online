import { EventQueue } from "../events/event-queue";
import { Player } from "./player";
import { FastArray } from "../utility/fast-array";
import { Projectile } from "./projectile";

export interface GameContext {
    SCREEN_WIDTH: number;
    SCREEN_HEIGHT: number;
    PLAYER_FORWARD_SPEED: number;
    PLAYER_ROTATION_SPEED: number;
    PROJECTILE_SPEED: number;
    PROJECTILE_DAMAGE: number;

    players: Player[];
    projectiles: FastArray<Projectile>;
    // rocks...
    // wrecks...
    // projectiles...
    // etc...
    eventQueue: EventQueue;
    log: (msg: string) => void;
    generateId: () => number;
}
