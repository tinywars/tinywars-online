import { ClientState } from "./client-state";

type PlayerInput = boolean[];

export interface NetGameState {
    id: string;
    clients: ClientState[];
    playerInputs: PlayerInput[];
    pointLimit: number;
}

export class NetGameStateManager {
    readonly state: NetGameState;
    private nofPlayersDisconnected = 0;
    private gameStarted = false;
    private collectedInputCount = 0;

    constructor(gameId: string) {
        this.state = {
            id: gameId,
            clients: [],
            playerInputs: [],
            pointLimit: 5,
        };
    }

    addNewClient(clientState: ClientState) {
        if (this.gameStarted) {
            throw Error("Game already started");
        }

        this.state.clients.push(clientState);
        this.state.playerInputs.push();
    }

    markClientAsDisconnected(id: string) {
        this.state.clients.forEach((state: ClientState) => {
            if (state.id !== id) return;
            state.disconnected = true;
            this.nofPlayersDisconnected++;
            this.collectedInputCount++;
        });
    }

    receiveClientInput(id: string, input: PlayerInput) {
        this.state.clients.forEach((client, index) => {
            if (client.id !== id) return;
            this.state.playerInputs[index] = input;
            this.collectedInputCount++;
        });
    }

    resetInputs() {
        this.collectedInputCount = 0;
    }

    startGame() {
        this.gameStarted = true;
    }

    isClientConnected(id: string) {
        return this.state.clients.find((cs) => cs.id === id) != undefined;
    }

    areAllInputsCollected(): boolean {
        return (
            this.collectedInputCount >=
            this.state.clients.length - this.nofPlayersDisconnected
        );
    }

    allClientsHaveDisconnected(): boolean {
        return this.nofPlayersDisconnected === this.state.clients.length;
    }

    hasGameStarted(): boolean {
        return this.gameStarted;
    }

    setLimit(limit: number) {
        this.state.pointLimit = limit;
    }
}
