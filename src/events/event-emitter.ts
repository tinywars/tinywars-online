import { EventEmitter, ListenerFn } from "eventemitter3";

export type GameEvent =
    | "GameStarted"
    | "GamePaused"
    | "GameResumed"
    | "GameStopped"
    | "ProjectileSpawned"
    | "ProjectileVanished"
    | "ProjectileWasDestroyed"
    | "PlayerWasHit"
    | "PlayerUsedTurbo"
    | "PlayerWasDestroyed"
    | "RockWasHit"
    | "WreckWasHit"
    | "PowerupPickedUp";

export class GameEventEmitter extends EventEmitter {
    override addListener(eventName: GameEvent, fn: ListenerFn): this {
        super.addListener(eventName, fn);
        return this;
    }

    override emit(eventName: GameEvent, ...args: any[]): boolean {
        return super.emit(eventName, ...args);
    }
}
