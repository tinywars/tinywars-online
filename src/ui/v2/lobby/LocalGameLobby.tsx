import {
    Accessor,
    createSignal,
    For,
    JSX,
    onCleanup,
    onMount,
    Setter
} from "solid-js";
import {
    PLAYER1_DEFAULT_CONTROLS,
    PLAYER2_DEFAULT_CONTROLS,
    PLAYER3_DEFAULT_CONTROLS,
    PLAYER4_DEFAULT_CONTROLS,
    PlayerSettings
} from "../../../game/player-settings";
import { AppController } from "../../appstate/AppController";
import { AppState } from "../../appstate/AppState";
import { PlayerSettingsCard } from "../../components/PlayerSettingsCard";
import { logMount, logUnmount } from "../../UiLogger";
import { GameState } from "../game/Game";

const [playersSettings, setPlayerSettings] = createSignal([
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
]);

export class LocalGameLobbyState extends AppState {
    private playerCount: Accessor<number>;
    private setPlayerCount: Setter<number>;

    constructor(app: AppController) {
        super(app);
        [this.playerCount, this.setPlayerCount] = createSignal(4);
    }

    override renderTo(setComponent: Setter<JSX.Element>): void {
        setComponent(() =>
            LocalGameLobbyView({
                navigateTo: (p: string) => {
                    this.navigateTo(p);
                },
                playerCount: this.playerCount,
                setPlayerCount: this.setPlayerCount,
                visiblePlayers: () =>
                    playersSettings().slice(0, this.playerCount()),
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
                    playersSettings,
                    Date.now(),
                ),
            );
        } else if (path === "back") this.app.popState();
    }
}

function LocalGameLobbyView(props: {
    navigateTo: (p: string) => void;
    playerCount: Accessor<number>;
    setPlayerCount: Setter<number>;
    visiblePlayers: () => PlayerSettings[];
}) {
    onMount(() => {
        logMount("LocalGameLobbyView");
    });

    onCleanup(() => {
        logUnmount("LocalGameLobbyView");
    });

    return (
        <>
            <h2 class="title">Local game</h2>
            <label for="PlayerCountInput">Number of players: </label>
            <input
                id="PlayerCountInput"
                type="number"
                min="2"
                max="4"
                value={props.playerCount()}
                onchange={(e) => {
                    props.setPlayerCount(parseInt(e.currentTarget.value));
                }}
            />
            <div id="PlayerSettingsCardsWrapper">
                <For each={props.visiblePlayers()}>
                    {(setting, i) => (
                        <PlayerSettingsCard
                            index={i()}
                            settings={setting}
                            setSettings={(settings: PlayerSettings) => {
                                const copy = playersSettings();
                                copy[i()] = settings;
                                setPlayerSettings(copy);
                            }}
                            enabled={true}
                            netgame={false}
                        />
                    )}
                </For>
            </div>

            <button
                onclick={() => props.navigateTo("game")}
                class="menu_button"
            >
                Start game
            </button>
            <br />
            <button
                onclick={() => props.navigateTo("back")}
                class="menu_button"
            >
                Back to menu
            </button>
        </>
    );
}
