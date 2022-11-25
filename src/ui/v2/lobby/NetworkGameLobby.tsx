import {
    Accessor,
    createSignal,
    For,
    Match,
    onCleanup,
    onMount,
    Setter,
    Switch
} from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { NetGameState } from "../../../../backend/src/types/game-state";
import {
    PLAYER1_DEFAULT_CONTROLS,
    PlayerSettings
} from "../../../game/player-settings";
import { TinywarsSocket } from "../../../networking/types";
import { AppController } from "../../appstate/AppController";
import { AppState } from "../../appstate/AppState";
import { PlayerSettingsCard } from "../../components/PlayerSettingsCard";
import { logMount, logUnmount } from "../../UiLogger";
import { GameState } from "../game/Game";

export class NetworkGameLobbyState extends AppState {
    private myIndex = 0;
    private playerSettings: Accessor<PlayerSettings[]>;
    private setPlayerSettings: Setter<PlayerSettings[]>;

    constructor(
        app: AppController,
        private socket: TinywarsSocket,
        readonly isSelfHosting: boolean,
        readonly gameId: string,
    ) {
        super(app);

        [this.playerSettings, this.setPlayerSettings] = createSignal<
            PlayerSettings[]
        >([]);

        this.setSocketListeners();

        if (this.isSelfHosting) {
            this.socket.emit("lobbyRequested", this.gameId);
        } else {
            // Lobby already exists, can join right away
            this.joinLobby(this.gameId);
        }
    }

    override renderTo(setComponent: Setter<JSX.Element>): void {
        setComponent(() =>
            NetworkGameLobbyView({
                navigateTo: (p: string) => {
                    this.navigateTo(p);
                },
                playerSettings: this.playerSettings,
                updateLocalPlayer: (settings: PlayerSettings) => {
                    this.updateLocalPlayer(settings);
                },
                myIndex: this.myIndex,
                isSelfHosting: this.isSelfHosting,
            }),
        );
    }

    override navigateTo(path: string): void {
        if (path === "game") {
            this.socket.emit("lobbyCommited", this.socket.id);
        } else if (path === "back") {
            this.socket.emit("lobbyLeft");
        }
    }

    override cleanup(): void {
        this.removeSocketListeners();
    }

    private setSocketListeners() {
        this.socket.on("lobbyUpdated", (gameState: NetGameState) => {
            this.updateAllPlayers(gameState);
        });

        this.socket.on("gameError", (message: string) => {
            alert(message);
            this.app.popState();
        });

        this.socket.on(
            "gameStarted",
            (gameState: NetGameState, seed: number) => {
                this.startGame(gameState, seed);
            },
        );

        if (this.isSelfHosting) {
            this.socket.on("lobbyCreated", () => {
                this.joinLobby(this.gameId);
            });
        }
    }

    private removeSocketListeners() {
        this.socket.removeListener("lobbyUpdated");
        this.socket.removeListener("gameError");
        this.socket.removeListener("gameStarted");

        if (this.isSelfHosting) {
            this.socket.removeListener("lobbyCreated");
        }
    }

    private updateAllPlayers(gameState: NetGameState) {
        const playerData: PlayerSettings[] = [];
        gameState.clients.forEach((c, i) => {
            if (c.id === this.socket.id) {
                this.myIndex = i;

                if (c.disconnected) {
                    this.quitGame();
                }
            }

            playerData.push({
                name: c.name,
                // not implemented in netgame
                invertSteeringOnReverse: false,
                // following two are completely ignored in netgame for anybody else than me
                isComputerControlled: false,
                controls: PLAYER1_DEFAULT_CONTROLS,
            });
        });
        this.setPlayerSettings(playerData);
    }

    private updateLocalPlayer(settings: PlayerSettings) {
        const copy = this.playerSettings();
        copy[this.myIndex] = settings;
        this.setPlayerSettings(copy);
        // TODO: emit change to socket this.socket.emit("")
    }

    private startGame(gameState: NetGameState, seed: number) {
        this.updateAllPlayers(gameState);
        this.app.pushState(
            new GameState(
                this.app,
                this.playerSettings().length,
                this.playerSettings,
                seed,
                this.socket,
                this.myIndex,
            ),
        );
    }

    private joinLobby(gameId: string) {
        const clientState = {
            id: this.socket.id,
            name: "default",
            disconnected: false,
            // TODO: steerOnReverse
        };
        this.socket.emit("lobbyEntered", gameId, clientState);
    }

    private quitGame() {
        this.app.popState();
    }
}

function NetworkGameLobbyView(props: {
    navigateTo: (path: string) => void;
    playerSettings: Accessor<PlayerSettings[]>;
    updateLocalPlayer: (settings: PlayerSettings) => void;
    myIndex: number;
    isSelfHosting: boolean;
}) {
    onMount(() => {
        logMount("NetworkGameLobbyView");
    });

    onCleanup(() => {
        logUnmount("NetworkGameLobbyView");
    });

    return (
        <>
            <h2 class="title">NetGameLobby</h2>
            <div id="PlayerSettingsCardsWrapper">
                <For each={props.playerSettings()}>
                    {(setting, i) => (
                        <PlayerSettingsCard
                            index={i()}
                            settings={setting}
                            setSettings={(settings: PlayerSettings) => {
                                props.updateLocalPlayer(settings);
                            }}
                            enabled={i() === props.myIndex}
                            netgame={true}
                        />
                    )}
                </For>
            </div>

            <Switch>
                <Match when={props.isSelfHosting}>
                    <button
                        onclick={() => props.navigateTo("game")}
                        classList={{
                            disabled_button: props.playerSettings().length < 2,
                        }}
                    >
                        Start Game
                    </button>
                </Match>
            </Switch>

            <button onclick={() => props.navigateTo("back")}>
                Leave Lobby
            </button>
        </>
    );
}
