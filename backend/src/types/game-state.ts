import { ClientState } from "./client-state";

export interface NetGameState {
    hostCode: string;
    clients: ClientState[];
}
