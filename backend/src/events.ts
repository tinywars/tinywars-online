export interface ClientState {
    id: number;
    name: string;
}

export interface LobbyState {
    clients: ClientState[];
}

export interface ServerEvents {
    lobbyUpdated: (lobbyState: LobbyState) => void;
    gameStarted: () => void;
    inputsCollected: (inputs: string[]) => void;
}

export interface ClientEvents {
    lobbyCreated: (clientState: ClientState) => void;
    clientChanged: (clientState: ClientState) => void;
    frameEnded: (input: string) => void;
}
