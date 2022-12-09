import { Accessor, createSignal, JSX, Setter } from "solid-js";
import {
    PLAYER1_DEFAULT_CONTROLS,
    PLAYER2_DEFAULT_CONTROLS,
    PLAYER3_DEFAULT_CONTROLS,
    PLAYER4_DEFAULT_CONTROLS,
    PlayerSettings
} from "../../game/player-settings";
import { AppController } from "../appstate/AppController";
import { AppState } from "../appstate/AppState";
import { GameState } from "../game/Game";
import { GameLobbyView } from "./GameLobbyView";

const DEFAULT_SETTINGS: PlayerSettings[] = [
    {
        name: "Red",
        invertSteeringOnReverse: true,
        isComputerControlled: false,
        controls: PLAYER1_DEFAULT_CONTROLS,
    },
    {
        name: "Green",
        invertSteeringOnReverse: false,
        isComputerControlled: false,
        controls: PLAYER2_DEFAULT_CONTROLS,
    },
    {
        name: "Blue",
        invertSteeringOnReverse: false,
        isComputerControlled: true,
        controls: PLAYER3_DEFAULT_CONTROLS,
    },
    {
        name: "Yellow",
        invertSteeringOnReverse: false,
        isComputerControlled: true,
        controls: PLAYER4_DEFAULT_CONTROLS,
    },
];

export class LocalGameLobbyState extends AppState {
    private playerCount: Accessor<number>;
    private setPlayerCount: Setter<number>;
    private playerSettings: Accessor<PlayerSettings[]>;
    private setPlayerSettings: Setter<PlayerSettings[]>;

    constructor(app: AppController) {
        super(app);
        [this.playerCount, this.setPlayerCount] = createSignal(4);
        [this.playerSettings, this.setPlayerSettings] =
            createSignal(DEFAULT_SETTINGS);
    }

    override renderTo(setComponent: Setter<JSX.Element>): void {
        setComponent(() =>
            GameLobbyView({
                navigateTo: (p: string) => {
                    this.navigateTo(p);
                },
                playerCount: () => this.playerCount(),
                setPlayerCount: (count: number) => {
                    this.setPlayerCount(count);
                },
                visiblePlayers: () =>
                    this.playerSettings().slice(0, this.playerCount()),
                updatePlayerSettings: (
                    index: number,
                    settings: PlayerSettings,
                ) => {
                    const copy = this.playerSettings();
                    copy[index] = settings;
                    this.setPlayerSettings(copy);
                },
                isNetgame: false,
                isSelfHosted: false,
                myIndex: () => -1,
            }),
        );
    }

    override navigateTo(path: string): void {
        console.log(`LocalGameLobbyState:navigateTo(${path})`);

        if (path === "game") {
            this.app.pushState(
                new GameState(
                    this.app,
                    this.playerCount(),
                    this.playerSettings,
                    Date.now(),
                ),
            );
        } else if (path === "back") this.app.popState();
    }
}
