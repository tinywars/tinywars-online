import { EventQueue } from "../events/event-queue"
import { Player } from "./player";

export interface GameContext {
    SCREEN_WIDTH: number;
    SCREEN_HEIGHT: number;

    player: Player;
    // players..
    // rocks...
    // wrecks...
    // projectiles...
    // etc...
    eventQueue: EventQueue;
    log: (msg: string) => void;
}