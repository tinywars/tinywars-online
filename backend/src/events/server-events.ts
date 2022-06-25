import { NetGameState } from "../types/game-state";

export interface ServerEvents {
    // Confirmation of lobbyRequested
    // After this, host can emit lobbyEntered to register itself into the game
    lobbyCreated: () => void;
    // Lobby state was updated somehow (player connected or player readied)
    lobbyUpdated: (gameState: NetGameState) => void;
    gameStarted: (gameCode: string, gameState: NetGameState) => void;
    gameInputsCollected: (inputs: boolean[][]) => void;
    gameError: (errorMessage: string) => void;
}
