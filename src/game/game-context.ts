import { EventQueue } from "../events/event-queue";
import { Player } from "./player";

export interface GameContext {
    SCREEN_WIDTH: number;
    SCREEN_HEIGHT: number;
    PLAYER_FORWARD_SPEED: number;
    PLAYER_ROTATION_SPEED: number;
    PROJECTILE_SPEED: number;

    players: Player[];
    // rocks...
    // wrecks...
    // projectiles...
    // etc...
    eventQueue: EventQueue;
    log: (msg: string) => void;
    generateId: () => number;
}
