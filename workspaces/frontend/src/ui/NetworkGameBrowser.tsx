import { Accessor, createSignal, onCleanup, onMount, Setter } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { NetGameInfo } from "../../../backend/src/types/game-info";
import { TinywarsSocket } from "../networking/types";
import { AppController } from "./appstate/AppController";
import { AppState } from "./appstate/AppState";
import { NetGameList } from "./components/NetGameList";
import { NetworkGameLobbyState } from "./lobby/NetworkGameLobby";
import { logMount, logUnmount } from "./UiLogger";

export class NetworkGameBrowserState extends AppState {
    private gameList: Accessor<NetGameInfo[]>;
    private setGameList: Setter<NetGameInfo[]>;

    constructor(app: AppController, private socket: TinywarsSocket) {
        super(app);

        [this.gameList, this.setGameList] = createSignal<NetGameInfo[]>([]);

        this.socket.on("gameListCollected", (list: NetGameInfo[]) => {
            this.setGameList(list);
        });
    }

    override renderTo(setComponent: Setter<JSX.Element>): void {
        setComponent(() =>
            NetworkGameBrowserView({
                navigateTo: (p: string) => {
                    this.navigateTo(p);
                },
                onGameJoined: (id: string) => {
                    this.joinGame(id);
                },
                gameList: this.gameList,
                socket: this.socket,
            }),
        );
    }

    override navigateTo(path: string): void {
        if (path === "back") this.app.popState();
    }

    override cleanup(): void {
        this.socket.removeListener("gameListCollected");
    }

    joinGame(id: string): void {
        this.app.pushState(
            new NetworkGameLobbyState(this.app, this.socket, false, id),
        );
    }
}

function NetworkGameBrowserView(props: {
    navigateTo: (path: string) => void;
    onGameJoined: (id: string) => void;
    gameList: Accessor<NetGameInfo[]>;
    socket: TinywarsSocket;
}) {
    onMount(() => {
        logMount("NetworkGameBrowserView");
    });

    onCleanup(() => {
        logUnmount("NetworkGameBrowserView");
    });

    return (
        <div class="container-100">
            <h2 class="title">Browse games</h2>
            <div class="container-80">
                <NetGameList
                    gameInfos={props.gameList}
                    onJoinClick={props.onGameJoined}
                    onRefresh={() => {
                        props.socket.emit("gameListRequested");
                    }}
                />
                <br />
                <div class="horizontal_button_group">
                    <button onclick={() => props.navigateTo("back")}>
                        Back to menu
                    </button>
                </div>
            </div>
        </div>
    );
}
