import { onCleanup, onMount, Setter } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { TinywarsSocket } from "../../networking/types";
import { AppController } from "../appstate/AppController";
import { AppState } from "../appstate/AppState";
import { logMount, logUnmount } from "../UiLogger";
import { NetworkGameLobbyState } from "./lobby/NetworkGameLobby";
import { NetworkGameBrowserState } from "./NetworkGameBrowser";

export class NetworkMainMenuState extends AppState {
    constructor(app: AppController, private socket: TinywarsSocket) {
        super(app);
    }

    renderTo(setComponent: Setter<JSX.Element>): void {
        setComponent(() =>
            NetworkMainMenuView({
                navigateTo: (p: string) => {
                    this.navigateTo(p);
                },
            }),
        );
    }
    navigateTo(path: string): void {
        console.log(`NetworkMainMenuState:navigateTo(${path})`);

        if (path === "host") {
            this.app.pushState(
                new NetworkGameLobbyState(
                    this.app,
                    this.socket,
                    true,
                    this.socket.id,
                ),
            );
        } else if (path === "list") {
            this.app.pushState(
                new NetworkGameBrowserState(this.app, this.socket),
            );
        } else if (path === "back") this.app.popState();
    }
}

function NetworkMainMenuView(props: { navigateTo: (p: string) => void }) {
    onMount(() => {
        logMount("NetworkMainMenuView");
    });

    onCleanup(() => {
        logUnmount("NetworkMainMenuView");
    });

    return (
        <>
            <h2 class="title">Network game</h2>
            <div id="MainMenu">
                <button
                    onclick={() => props.navigateTo("host")}
                    class="menu_button"
                >
                    Host game
                </button>
                <button
                    onclick={() => props.navigateTo("list")}
                    class="menu_button"
                >
                    Browse games
                </button>
                <button
                    onclick={() => props.navigateTo("back")}
                    class="menu_button"
                >
                    Back to menu
                </button>
            </div>
        </>
    );
}
