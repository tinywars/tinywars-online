import { EventQueue } from "../events/event-queue";
import { Player } from "./player";
import { FastArray } from "../utility/fast-array";
import { Projectile } from "./projectile";
import { Obstacle } from "./obstacle";
import { GameSettings } from "./game-settings";
import { GameEventEmitter } from "../events/event-emitter";
import { Powerup } from "./powerup";

export interface GameContext {
    settings: GameSettings;

    players: FastArray<Player>;
    projectiles: FastArray<Projectile>;
    obstacles: FastArray<Obstacle>;
    powerups: FastArray<Powerup>;
    scores: number[];
    wins: number[];

    eventQueue: EventQueue;
    eventEmitter: GameEventEmitter;
    log: (msg: string) => void;
}
