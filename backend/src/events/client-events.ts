import { ClientState } from "../types/client-state";

export interface ClientEvents {
    // Client requested server to create a lobby
    lobbyRequested: (clientState: ClientState) => void;
    // Client who created the lobby requested the game to start
    lobbyCommited: (clientState: ClientState) => void;
    // Client with connection code requested to join
    // This is automatic for the player who created the lobby
    lobbyEntered: (connectionCode: string, clientState: ClientState) => void;
    //clientChanged: (clientState: ClientState) => void;
    frameEnded: (input: string) => void;
}
