import { Accessor, createSignal, Setter } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import type { ClientState } from "../../../../backend/src/types/client-state";
import type { NetGameState } from "../../../../backend/src/types/game-state";
import {
    PLAYER1_DEFAULT_CONTROLS,
    PlayerSettings
} from "../../game/player-settings";
import { TinywarsSocket } from "../../networking/types";
import { AppController } from "../appstate/AppController";
import { GameState } from "../game/Game";
import { GameLobbyCommon } from "./GameLobbyCommon";
import { GameLobbyView } from "./GameLobbyView";

export class NetworkGameLobbyState extends GameLobbyCommon {
    private playerSettings: Accessor<PlayerSettings[]>;
    private setPlayerSettings: Setter<PlayerSettings[]>;
    private myIndex: Accessor<number>;
    private setMyIndex: Setter<number>;
    private mySettings: Accessor<PlayerSettings>;

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

        this.mySettings = () => this.playerSettings()[this.myIndex()];

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
                pointLimit: this.pointLimit,
                setPointLimit: (limit: number) => { this.setPointLimitToAll(limit); },
            }),
        );
    }

    override navigateTo(path: string): void {
        if (path === "game") {
            this.socket.emit("lobbyCommitted", this.socket.id);
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
            this.setPointLimit(gameState.pointLimit);
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
        gameState.clients.forEach((clientState, i) => {
            const isMyState = clientState.id === this.socket.id;
            if (isMyState) {
                this.setMyIndex(i);

                if (clientState.disconnected) {
                    this.quitGame();
                }
            }

            const mySettingsAreInitialized =
                this.playerSettings().length > this.myIndex();
            const invertSteeringOnReverse =
                isMyState && mySettingsAreInitialized
                    ? this.mySettings().invertSteeringOnReverse
                    : false;

            playerData.push({
                name: clientState.name,
                invertSteeringOnReverse,
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

        const clientState: ClientState = {
            id: this.socket.id,
            name: settings.name,
            disconnected: false,
        };
        this.socket.emit("lobbyPlayerUpdated", clientState);
    }

    private startGame(gameState: NetGameState, seed: number) {
        this.updateAllPlayers(gameState);
        this.app.pushState(
            new GameState(
                this.app,
                this.playerSettings().length,
                this.playerSettings,
                seed,
                this.pointLimit(),
                this.setFinalScores,
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
        };
        this.socket.emit("lobbyEntered", gameId, clientState);
    }

    private setPointLimitToAll(limit: number) {
        this.socket.emit("lobbyPointLimitSet", limit);
    }

    private quitGame() {
        this.app.popState();
    }
}
