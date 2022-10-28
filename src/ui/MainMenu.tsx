import {
    DefaultRoute,
    Link,
    Route,
    Router,
    Routes
} from "@gh0st-work/solid-js-router";
import { io } from "socket.io-client";
import { Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { BACKEND_PORT } from "../../backend/src/settings";
import { TinywarsSocket } from "../networking/types";
import { LocalGameLobby } from "./lobby/LocalGameLobby";
import { NetworkMainMenu } from "./NetworkMainMenu";

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

    onMount(() => {
        console.log("MainMenu:onMount");
    });

    onCleanup(() => {
        console.log("MainMenu:onCleanup");
    });

    return (
        <Router>
            <div id="ConnectionStatus">
                Connection status:{" "}
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
            <Routes>
                <Route path={"/local"}>
                    <LocalGameLobby />
                </Route>
                <Route path={"/network"}>
                    <NetworkMainMenu socket={socket} />
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
            <h1 class="title">Tinywars</h1>
            <div id="MainMenu">
                <Link href={"/local"} class="menu_button">
                    Local Game
                </Link>
                <br />
                <span
                    classList={{
                        disabled_button: !props.isConnected(),
                    }}
                >
                    <Link href={"/network"} class="menu_button">
                        Network Game
                    </Link>
                </span>
            </div>
        </>
    );
}
