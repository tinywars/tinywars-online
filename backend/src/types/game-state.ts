import { ClientState } from "./client-state";

type PlayerInput = boolean[];

export interface NetGameState {
    clients: ClientState[];
    collectedInputCount: number;
    playerInputs: PlayerInput[];
}
