export interface ClientState {
    // Unique identified of client on backend
    // It is okay if this changes each time client reloads the window
    id: number;
    // Display name of the player, this can be changed on whim, client is
    // identified by their id
    name: string;
}

export interface LobbyState {
    hostCode: string;
    clients: ClientState[];
}

export interface ServerEvents {
    // Confirmation of lobbyRequested. Returns URL to which other peers can connect
    lobbyCreated: (connectionCode: string) => void;
    // Lobby state was updated somehow (player connected or player readied)
    lobbyUpdated: (lobbyState: LobbyState) => void;
    lobbyError: (errorMessage: string) => void;
    gameStarted: (lobbyState: LobbyState) => void;
    inputsCollected: (inputs: string[]) => void;
}

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
