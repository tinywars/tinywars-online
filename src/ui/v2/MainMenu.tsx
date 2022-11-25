import { JSX, onCleanup, onMount, Setter } from "solid-js";
import { TinywarsSocket } from "../../networking/types";
import { AppController } from "../appstate/AppController";
import { AppState } from "../appstate/AppState";
import { logMount, logUnmount } from "../UiLogger";
import { LocalGameLobbyState } from "./lobby/LocalGameLobby";
import { NetworkMainMenuState } from "./NetworkMainMenu";

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
        <>
            <h1 class="title">Tinywars</h1>
            <div id="MainMenu">
                <button
                    onclick={() => props.navigateTo("local")}
                    class="menu_button"
                >
                    Local Game
                </button>
                <br />
                <button
                    onclick={() => props.navigateTo("network")}
                    /*classList={{
                        disabled_button: !props.isConnected(),
                    }}*/
                    class="menu_button"
                >
                    Network Game
                </button>
            </div>
        </>
    );
}