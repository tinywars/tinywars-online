import { GameContext } from "../game/game-context";

export interface AppState {
    updateLogic(dt: number): void;
    getContext(): GameContext;
}
