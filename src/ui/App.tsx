import { io } from "socket.io-client";
import { createSignal, onMount } from "solid-js";
import { BACKEND_PORT } from "../../backend/src/settings";
import { TinywarsSocket } from "../networking/types";
import "./App.css";
import { AppController } from "./appstate/AppController";
import { EmptyComponent } from "./appstate/EmptyComponent";
import { MainMenuState } from "./MainMenu";

enum ConnectionStatus {
    Waiting = "Waiting",
    Connected = "Connected",
    Error = "Error",
}

export function AppTopLevel() {
    const [activeComponent, setActiveComponent] = createSignal(EmptyComponent);
    // setActiveComponent threw type error, dunno why, it works
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controller = new AppController(setActiveComponent as any);

    /* socket */
    const socket: TinywarsSocket = io(
        `http://${window.location.hostname}:${BACKEND_PORT}`,
        { transports: ["websocket"] },
    );

    const [connectStatus, setConnectStatus] = createSignal(
        ConnectionStatus.Waiting,
    );

    const isConnected = () => connectStatus() === ConnectionStatus.Connected;

    socket.on("connect", () => {
        setConnectStatus(ConnectionStatus.Connected);
    });

    socket.on("connect_error", (/*err*/) => {
        setConnectStatus(ConnectionStatus.Error);
    });

    onMount(() => {
        controller.pushState(
            new MainMenuState(controller, socket, isConnected),
        );
    });

    return (
        <>
            {activeComponent()}
            <div id="ConnectionStatus">
                Connection Status:{" "}
                <span
                    classList={{
                        text_success:
                            connectStatus() === ConnectionStatus.Connected,
                        text_warning:
                            connectStatus() === ConnectionStatus.Waiting,
                        text_error: connectStatus() === ConnectionStatus.Error,
                    }}
                >
                    {connectStatus()}
                </span>
            </div>
        </>
    );
}
