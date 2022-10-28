import { Link, Route, Routes } from "@gh0st-work/solid-js-router";
import { Component, createSignal, For } from "solid-js";
import {
    PLAYER1_DEFAULT_CONTROLS,
    PLAYER2_DEFAULT_CONTROLS,
    PLAYER3_DEFAULT_CONTROLS,
    PLAYER4_DEFAULT_CONTROLS,
    PlayerSettings
} from "../../game/player-settings";
import { PlayerSettingsCard } from "../components/PlayerSettingsCard";
import { Game } from "../game/Game";

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
const visiblePlayers = () => playersSettings().slice(0, playerCount());

export const LocalGameLobby: Component = () => {
    return (
        <Routes>
            <Route path={"/game"}>
                <Game
                    settings={playersSettings}
                    playerCount={playerCount()}
                    gameSeed={Date.now()}
                />
            </Route>
            <Route path={"/"}>
                <LocalGameLobbyView />
            </Route>
        </Routes>
    );
};

function LocalGameLobbyView() {
    return (
        <>
            <h2 class="title">Local game</h2>
            <label for="PlayerCountInput">Number of players: </label>
            <input
                id="PlayerCountInput"
                type="number"
                min="2"
                max="4"
                value={playerCount()}
                onchange={(e) => {
                    setPlayerCount(parseInt(e.currentTarget.value));
                }}
            />
            <div id="PlayerSettingsCardsWrapper">
                <For each={visiblePlayers()}>
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

            <Link href="local/game" class="menu_button">
                Start game
            </Link>
            <br />
            <Link href="/" class="menu_button">
                Back to menu
            </Link>
        </>
    );
}
