import { ClientState } from "../types/client-state";

export interface ClientEvents {
    // Client requested server to create a lobby
    lobbyRequested: (gameCode: string) => void;
    // Client who created the lobby requested the game to start
    lobbyCommitted: (gameCode: string) => void;
    // Client with connection code requested to join
    // This is automatic for the player who created the lobby
    lobbyEntered: (gameCode: string, clientState: ClientState) => void;
    lobbyPlayerUpdated: (clientState: ClientState) => void;
    lobbyPointLimitSet: (limit: number) => void;
    lobbyLeft: () => void;
    gameInputGathered: (inputs: boolean[], callback: () => void) => void;
    gameListRequested: () => void;
}
