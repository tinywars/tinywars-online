import { EventEmitter } from "eventemitter3";

export interface GameEvents {
    "GameStarted": never,
    "GamePaused": never,
    "GameResumed": never,
    "GameStopped": never,
    "ProjectileSpawned": number,
    "ProjectileVanished": never,
    "ProjectileWasDestroyed": never,
    "PlayerWasHit": never,
    "PlayerUsedTurbo": never,
    "PlayerWasDestroyed": never,
    "RockWasHit": never,
    "WreckWasHit": never,
    "ObstacleBounced": never,
    "PowerupPickedUp": never,
}

export type GameEvent = keyof GameEvents

export class GameEventEmitter extends EventEmitter {
    override addListener<T extends GameEvent>(eventName: T, fn: (payload: GameEvents[T]) => void): this {
        super.addListener(eventName, fn);
        return this;
    }

    override emit<T extends GameEvent>(eventName: T, payload?: GameEvents[T]): boolean {
        return super.emit(eventName, payload);
    }
}
