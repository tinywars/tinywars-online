import { Component, createSignal, For, Match, Switch } from "solid-js";
import {
    PLAYER1_DEFAULT_CONTROLS,
    PLAYER2_DEFAULT_CONTROLS,
    PLAYER3_DEFAULT_CONTROLS,
    PLAYER4_DEFAULT_CONTROLS,
    PlayerSettings
} from "../game/player-settings";
import { Game } from "./Game";
import { PlayerSettingsCard } from "./PlayerSettingsCard";

export const LocalGameLobby: Component = () => {
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
    const [playerCount, setPlayerCount] = createSignal(4);
    const [isGameShown, setIsGameShown] = createSignal(false);

    return (
        <Switch>
            <Match when={isGameShown()}>
                <Game
                    settings={playersSettings}
                    playerCount={playerCount()}
                    onGameExit={() => {
                        setIsGameShown(false);
                    }}
                    gameSeed={Date.now()}
                />
            </Match>
            <Match when={!isGameShown()}>
                <input
                    type="number"
                    min="2"
                    max="4"
                    value={playerCount()}
                    onchange={(e) => {
                        setPlayerCount(parseInt(e.currentTarget.value));
                    }}
                />
                <For each={playersSettings()}>
                    {(setting, i) => (
                        <Switch fallback={<div class="playerSettings"></div>}>
                            <Match when={i() < playerCount()}>
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
                            </Match>
                        </Switch>
                    )}
                </For>
                <button onClick={() => setIsGameShown(!isGameShown())}>
                    Start game
                </button>
            </Match>
        </Switch>
    );
};
