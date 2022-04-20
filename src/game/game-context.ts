import { EventQueue } from "../events/event-queue"

export interface GameContext {
    // players..
    // rocks...
    // wrecks...
    // projectiles...
    // etc...
    eventQueue: EventQueue;
    log: (msg: string) => void;
}