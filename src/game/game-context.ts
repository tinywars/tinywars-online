import { GameEventEmitter } from "../events/event-emitter";
import { EventQueue } from "../events/event-queue";
import { FastArray } from "../utility/fast-array";
import { Effect } from "./effect";
import { GameSettings } from "./game-settings";
import { Obstacle } from "./obstacle";
import { Player } from "./player";
import { Powerup } from "./powerup";
import { Projectile } from "./projectile";

export interface GameContext {
    settings: GameSettings;

    players: FastArray<Player>;
    projectiles: FastArray<Projectile>;
    obstacles: FastArray<Obstacle>;
    powerups: FastArray<Powerup>;
    effects: FastArray<Effect>;
    scores: number[];
    wins: number[];

    eventQueue: EventQueue;
    eventEmitter: GameEventEmitter;
    log: (msg: string) => void;
}
