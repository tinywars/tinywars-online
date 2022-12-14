import { Accessor, createSignal, Setter } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import type { NetGameState } from "../../../../backend/src/types/game-state";
import {
    PLAYER1_DEFAULT_CONTROLS,
    PlayerSettings
} from "../../game/player-settings";
import { TinywarsSocket } from "../../networking/types";
import { AppController } from "../appstate/AppController";
import { AppState } from "../appstate/AppState";
import { GameState } from "../game/Game";
import { GameLobbyView } from "./GameLobbyView";

// FIXME: this.myIndex should be accessor, because it is set late
// and then network settings are broken

export class NetworkGameLobbyState extends AppState {
    //private myIndex = -1;
    private playerSettings: Accessor<PlayerSettings[]>;
    private setPlayerSettings: Setter<PlayerSettings[]>;
    private myIndex: Accessor<number>;
    private setMyIndex: Setter<number>;

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

        [this.myIndex, this.setMyIndex] = createSignal(-1);

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
            GameLobbyView({
                navigateTo: (p: string) => {
                    this.navigateTo(p);
                },
                playerCount: () => this.playerSettings().length,
                setPlayerCount: () => {
                    /* intentionally left blank */
                },
                visiblePlayers: () => this.playerSettings(),
                updatePlayerSettings: (_: number, settings: PlayerSettings) => {
                    this.updateLocalPlayer(settings);
                },
                isNetgame: true,
                isSelfHosted: this.isSelfHosting,
                myIndex: () => this.myIndex(),
            }),
        );
    }

    override navigateTo(path: string): void {
        if (path === "game") {
            this.socket.emit("lobbyCommited", this.socket.id);
        } else if (path === "back") {
            this.socket.emit("lobbyLeft");
            this.quitGame();
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
            const isMyState = c.id === this.socket.id;
            if (isMyState) {
                this.setMyIndex(i);

                if (c.disconnected) {
                    this.quitGame();
                }
            }

            const mySettingsAreInitialized = this.playerSettings().length > this.myIndex();
            const invertSteeringOnReverse = isMyState && mySettingsAreInitialized
                ? this.playerSettings()[this.myIndex()].invertSteeringOnReverse
                : false;

            playerData.push({
                name: c.name,
                invertSteeringOnReverse: invertSteeringOnReverse,
                // following two are completely ignored in netgame for anybody else than me
                isComputerControlled: false,
                controls: PLAYER1_DEFAULT_CONTROLS,
            });
        });
        this.setPlayerSettings(playerData);
    }

    private updateLocalPlayer(settings: PlayerSettings) {
        const copy = this.playerSettings();
        copy[this.myIndex()] = settings;
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
                this.myIndex(),
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
