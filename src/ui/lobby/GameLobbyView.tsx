import { For, Match, onCleanup, onMount, Switch } from "solid-js";
import { PlayerSettings } from "../../game/player-settings";
import { PlayerSettingsCard } from "../components/PlayerSettingsCard";
import { logMount, logUnmount } from "../UiLogger";
import "./GameLobbyView.css";

export function GameLobbyView(props: {
    navigateTo: (p: string) => void;
    playerCount: () => number;
    setPlayerCount: (count: number) => void;
    visiblePlayers: () => PlayerSettings[];
    updatePlayerSettings: (index: number, settings: PlayerSettings) => void;
    isNetgame: boolean;
    isSelfHosted: boolean;
    myIndex: () => number; // index of this player in netgame
}) {
    onMount(() => {
        logMount("GameLobbyView");
    });

    onCleanup(() => {
        logUnmount("GameLobbyView");
    });

    return (
        <div class="container-100">
            <h2 class="title">Local game</h2>
            <div class="container-80">
                <div class="hbox gap-1">
                    <div id="LobbyOptionBar" class="vbox">
                        <Switch>
                            <Match when={!props.isNetgame}>
                                <div class="hbox space-between">
                                    <label for="PlayerCountInput">
                                        Number of players:
                                    </label>
                                    <input
                                        id="PlayerCountInput"
                                        type="number"
                                        min="2"
                                        max="4"
                                        value={props.playerCount()}
                                        onchange={(e) => {
                                            props.setPlayerCount(
                                                parseInt(e.currentTarget.value),
                                            );
                                        }}
                                    />
                                </div>
                            </Match>
                        </Switch>

                        <div class="hbox space-between">
                            <label for="GameModeInput">Game mode:</label>
                            <select
                                id="GameModeInput"
                                disabled={
                                    props.isNetgame && !props.isSelfHosted
                                }
                            >
                                <option value="default">Vanilla</option>
                            </select>
                        </div>
                    </div>
                    <div id="PlayerSettingsCardsWrapper">
                        <For each={props.visiblePlayers()}>
                            {(setting, i) => (
                                <PlayerSettingsCard
                                    index={i()}
                                    settings={setting}
                                    setSettings={(settings: PlayerSettings) => {
                                        props.updatePlayerSettings(
                                            i(),
                                            settings,
                                        );
                                    }}
                                    enabled={
                                        !props.isNetgame ||
                                        i() === props.myIndex()
                                    }
                                    netgame={props.isNetgame}
                                />
                            )}
                        </For>
                    </div>
                </div>

                <br></br>

                <div class="hbox space-between">
                    <Switch>
                        <Match when={!props.isNetgame || props.isSelfHosted}>
                            <button
                                onclick={() => props.navigateTo("game")}
                                classList={{
                                    disabled_button: props.playerCount() < 2,
                                }}
                            >
                                Start game
                            </button>
                        </Match>
                    </Switch>

                    <button onclick={() => props.navigateTo("back")}>
                        Back to menu
                    </button>
                </div>
            </div>
        </div>
    );
}
