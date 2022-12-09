import { JSX, onCleanup, onMount, Setter } from "solid-js";
import { TinywarsSocket } from "../networking/types";
import { AppController } from "./appstate/AppController";
import { AppState } from "./appstate/AppState";
import { LocalGameLobbyState } from "./lobby/LocalGameLobby";
import "./MainMenu.css";
import { NetworkMainMenuState } from "./NetworkMainMenu";
import { logMount, logUnmount } from "./UiLogger";

export class MainMenuState extends AppState {
    constructor(
        app: AppController,
        private socket: TinywarsSocket,
        private isConnected: () => boolean,
    ) {
        super(app);
    }

    override renderTo(setComponent: Setter<JSX.Element>): void {
        // This is a lot of boiler plate :( but I can pass in everything I need to views
        setComponent(() =>
            MainMenuView({
                navigateTo: (p: string) => {
                    this.navigateTo(p);
                },
                isConnected: () => {
                    return this.isConnected();
                },
            }),
        );
    }

    override navigateTo(path: string): void {
        // Enum is probably a better option here, but that would not be compatible with inheritance
        console.log(`MainMenuState:navigateTo(${path})`);
        // I can pass whatever I need to newly created states
        if (path === "local")
            this.app.pushState(new LocalGameLobbyState(this.app));
        else if (path === "network")
            this.app.pushState(new NetworkMainMenuState(this.app, this.socket));
    }
}

function MainMenuView(props: {
    navigateTo: (path: string) => void;
    isConnected: () => boolean;
}) {
    onMount(() => {
        logMount("MainMenuView");
    });

    onCleanup(() => {
        logUnmount("MainMenuView");
    });

    return (
        <div class="container-100">
            <h1 class="title">Tinywars</h1>
            <div class="container-20">
                <div class="vertical_button_group">
                    <button onclick={() => props.navigateTo("local")}>
                        Local Game
                    </button>
                    <button
                        onclick={() => props.navigateTo("network")}
                        classList={{
                            disabled_button: !props.isConnected(),
                        }}
                    >
                        Network Game
                    </button>
                </div>
            </div>
        </div>
    );
}
