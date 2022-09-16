import { io } from "socket.io-client";
import { Component, createSignal, Match, Switch } from "solid-js";
import { BACKEND_PORT } from "../../backend/src/settings";
import { TinywarsSocket } from "../networking/types";
import { LocalGameLobby } from "./LocalGameLobby";
import { NetworkGameLobby } from "./NetworkGameLobby";

enum ConnectionStatus {
    Waiting = "Waiting",
    Connected = "Connected",
    Error = "Error",
}

export const MainMenu: Component = () => {
    const [connectStatus, setConnectStatus] = createSignal(
        ConnectionStatus.Waiting,
    );

    const socket: TinywarsSocket = io(
        `http://${window.location.hostname}:${BACKEND_PORT}`,
        { transports: ["websocket"] },
    );

    socket.on("connect", () => {
        setConnectStatus(ConnectionStatus.Connected);
    });

    socket.on("connect_error", (/*err*/) => {
        setConnectStatus(ConnectionStatus.Error);
    });

    return (
        <div>
            <div>Connection status: {connectStatus()}</div>
            <Switch fallback={<LocalGameLobby />}>
                <Match when={connectStatus() == ConnectionStatus.Connected}>
                    <NetworkGameLobby socket={socket} />
                </Match>
            </Switch>
        </div>
    );
};
