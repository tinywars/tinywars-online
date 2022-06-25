import { NetGameState } from "../types/game-state";

export interface ServerEvents {
    // Confirmation of lobbyRequested. Returns URL to which other peers can connect
    lobbyCreated: (connectionCode: string) => void;
    // Lobby state was updated somehow (player connected or player readied)
    lobbyUpdated: (lobbyState: NetGameState) => void;
    lobbyError: (errorMessage: string) => void;
    gameStarted: (lobbyState: NetGameState) => void;
    inputsCollected: (inputs: string[]) => void;
}
