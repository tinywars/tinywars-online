import {
    DefaultRoute,
    Link,
    Route,
    Router,
    Routes
} from "@gh0st-work/solid-js-router";
import { io } from "socket.io-client";
import { Accessor, createSignal } from "solid-js";
import { BACKEND_PORT } from "../../backend/src/settings";
import { TinywarsSocket } from "../networking/types";
import { LocalGameLobby } from "./lobby/LocalGameLobby";

enum ConnectionStatus {
    Waiting = "Waiting",
    Connected = "Connected",
    Error = "Error",
}

export function MainMenu() {
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

    return (
        <Router>
            Status: {connectStatus()}
            <hr />
            <Routes>
                <Route path={"/local"}>
                    <LocalGameLobby />
                </Route>
                <Route path={"/network"}>
                    <div>BBBBB</div>
                    {/* <NetGamePicker socket={socket} /> */}
                </Route>
                {/*
                    Slash route must be LAST, as it matches everything
                    and routes are matched from top to bottom
                 */}
                <Route path={"/"} fallback={true}>
                    {() => <MainMenuView isConnected={isConnected} />}
                </Route>
                <DefaultRoute to={"/"} />
            </Routes>
        </Router>
    );
}

function MainMenuView(props: { isConnected: Accessor<boolean> }) {
    return (
        <>
            <Link href={"/local"}>Local Game</Link>
            <br />
            {/* Reactive properties on the Link element don't work, so we wrap it with span */}
            <span
                classList={{
                    disabled: !props.isConnected(),
                }}
            >
                <Link href={"/network"}>Network Game</Link>
            </span>
        </>
    );
}
