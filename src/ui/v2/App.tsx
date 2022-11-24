import { io } from "socket.io-client";
import { createSignal, onMount } from "solid-js";
import { BACKEND_PORT } from "../../../backend/src/settings";
import { TinywarsSocket } from "../../networking/types";
import { AppController } from "../appstate/AppController";
import { MainMenuState } from "./MainMenu";

/*
class LocalLobbyState extends AppState {
    constructor(app: AppController) {
        super(app);
    }

    override renderTo(component: Accessor<JSX.Element>): void {
        component(() =>
            LocalLobbyView({
                navigateTo: (p: string) => {
                    this.navigateTo(p);
                },
            }),
        );
    }

    override navigateTo(path: string): void {
        console.log(`LocalLobbyState:navigateTo(${path})`);
        if (path === "back") this.app.popState();
    }
}

function LocalLobbyView(props: { navigateTo: (path: string) => void }) {
    return (
        <>
            <h1>Local Lobby</h1>
            <button onclick={() => props.navigateTo("back")}>Go back</button>
        </>
    );
}
*/

export function EmptyComponent2() {
    return (
        <>
            <h1>404</h1>
            <div>Empty component</div>
        </>
    );
}

enum ConnectionStatus {
    Waiting = "Waiting",
    Connected = "Connected",
    Error = "Error",
}

export function AppTopLevel() {
    const [activeComponent, setActiveComponent] = createSignal(EmptyComponent2);
    const controller = new AppController(setActiveComponent);

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

    return <>{activeComponent()}</>;
}
