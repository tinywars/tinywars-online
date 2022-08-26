import { Component, createSignal, For, Match, Switch } from "solid-js";
import {
    PLAYER1_DEFAULT_CONTROLS,
    PLAYER2_DEFAULT_CONTROLS,
    PLAYER3_DEFAULT_CONTROLS,
    PLAYER4_DEFAULT_CONTROLS
} from "../game/player-settings";
import { Checkbox } from "./Checkbox";
import { Game } from "./Game";

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
    const toggleSteerInvert = (index: number) => {
        setPlayerSettings((settings) => {
            const val = settings[index].invertSteeringOnReverse;
            settings[index].invertSteeringOnReverse = !val;
            return settings;
        });
    };
    const toggleComputerControl = (index: number) => {
        setPlayerSettings((settings) => {
            const val = settings[index].isComputerControlled;
            settings[index].isComputerControlled = !val;
            return settings;
        });
    };
    const [isGameShown, setIsGameShown] = createSignal(false);

    /* TODO:
        1) Game settings so far only allow for having first N players to be human
           and only the rest to be computer controlled.
        2) Propagate playerSettings+playerCount (+ possibly mode settings in the future)
           into the game component.
        3) Hide lobby when game is started
        4) Allow to exit the game (callback on pressed Esc could be enough for now or some
           overlayed button).
     */

    return (
        <Switch fallback={<div>Click to show game</div>}>
            <Match when={isGameShown()}>
                <Game
                    settings={playersSettings}
                    playerCount={playerCount}
                    setIsGameShown={setIsGameShown}
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
                                <div class="playerSettings">
                                    <input type="text" value={setting.name} />

                                    <label for={(() => `InvertSteer{i()}`)()}>
                                        Invert steering on reverse
                                    </label>
                                    <Checkbox
                                        id={(() => `InvertSteer{i()}`)()}
                                        name="InvertSteer"
                                        checked={
                                            setting.invertSteeringOnReverse
                                        }
                                        onToggle={() => {
                                            toggleSteerInvert(i());
                                        }}
                                    />
                                    <label
                                        for={(() => `ComputerControl{i()}`)()}
                                    >
                                        Computer controlled?
                                    </label>
                                    <Checkbox
                                        id={(() => `ComputerControl{i()}`)()}
                                        name="ComputerControl"
                                        checked={setting.isComputerControlled}
                                        onToggle={() => {
                                            toggleComputerControl(i());
                                        }}
                                    />
                                </div>
                            </Match>
                        </Switch>
                    )}
                </For>
                <button onClick={() => setIsGameShown(!isGameShown())}>
                    {isGameShown() ? "Hide game" : "Show game"}
                </button>
            </Match>
        </Switch>
    );
};
