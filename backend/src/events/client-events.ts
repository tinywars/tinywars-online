import { ClientState } from "../types/client-state";

export interface ClientEvents {
    // Client requested server to create a lobby
    lobbyRequested: (gameCode: string) => void;
    // Client who created the lobby requested the game to start
    lobbyCommited: (gameCode: string) => void;
    // Client with connection code requested to join
    // This is automatic for the player who created the lobby
    lobbyEntered: (gameCode: string, clientState: ClientState) => void;
    gameInputGathered: (clientId: string, inputs: boolean[]) => void;
}
