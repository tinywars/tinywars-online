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
import { ClientState } from "../../../backend/src/types/client-state";
import { NetGameState } from "../../../backend/src/types/game-state";
import {
    PLAYER1_DEFAULT_CONTROLS,
    PlayerSettings
} from "../../game/player-settings";
import { TinywarsSocket } from "../../networking/types";
import { PlayerSettingsCard } from "../components/PlayerSettingsCard";
import { Game } from "../game/Game";

export interface NetGameLobbyProps {
    socket: TinywarsSocket;
    clientState: Accessor<ClientState>;
    setClientState: Setter<ClientState>;
    setGameJoined: Setter<boolean>;
    isSelfHosting: boolean; // am I the host?
}

export function NetGameLobby(props: NetGameLobbyProps) {
    /* Signals and properties */
    const [playersSettings, setPlayerSettings] = createSignal<PlayerSettings[]>(
        [],
    );
    const [isGameShown, setIsGameShown] = createSignal(false);
    let myIndex = 0;
    let gameSeed = 0;

    /* Methods and callbacks */
    const updatePlayers = (gameState: NetGameState) => {
        const playerData: PlayerSettings[] = [];
        gameState.clients.forEach((c, i) => {
            if (c.id === props.clientState().id) {
                myIndex = i;

                if (c.disconnected) {
                    setIsGameShown(false);
                    // TODO: should quit lobby completely
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
        setPlayerSettings(playerData);
    };

    /* onMount, onCleanup */
    onMount(() => {
        props.socket.on("lobbyUpdated", (gameState: NetGameState) => {
            updatePlayers(gameState);
        });

        props.socket.on("gameError", (message: string) => {
            props.setGameJoined(false); // Go back to game picker
            alert(message);
        });

        props.socket.on(
            "gameStarted",
            (gameState: NetGameState, seed: number) => {
                updatePlayers(gameState);
                gameSeed = seed;
                setIsGameShown(true);
                // TODO: rest of setup
            },
        );
    });

    onCleanup(() => {
        // TODO: clear socket callbacks?
    });

    /* HTML */
    return (
        <Switch>
            <Match when={isGameShown()}>
                <Game
                    settings={playersSettings}
                    playerCount={playersSettings().length}
                    // TODO: Refactor net game
                    onGameExit={() => {
                        props.socket.emit("lobbyLeft");
                    }}
                    gameSeed={gameSeed}
                    socket={props.socket}
                    myIndex={myIndex}
                />
            </Match>
            <Match when={!isGameShown()}>
                <h2>NetGameLobby</h2>
                <For each={playersSettings()}>
                    {(setting, i) => (
                        <PlayerSettingsCard
                            index={i()}
                            settings={setting}
                            setSettings={(settings: PlayerSettings) => {
                                const copy = playersSettings();
                                copy[i()] = settings;
                                setPlayerSettings(copy);
                                // TODO: socket event for updated player name/settings
                            }}
                            enabled={i() === myIndex}
                            netgame={true}
                        />
                    )}
                </For>
                <Switch>
                    <Match when={props.isSelfHosting}>
                        <button
                            disabled={playersSettings().length < 2}
                            onclick={() => {
                                props.socket.emit(
                                    "lobbyCommited",
                                    props.clientState().id,
                                );
                            }}
                        >
                            Start game
                        </button>
                    </Match>
                </Switch>
            </Match>
        </Switch>
    );
}
