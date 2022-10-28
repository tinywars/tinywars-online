import { Link, Route, Routes } from "@gh0st-work/solid-js-router";
import {
    Accessor,
    createSignal,
    For,
    Match,
    onCleanup,
    onMount,
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
    isSelfHosting: boolean; // am I the host?
    gameId: string;
}

/* Signals and properties */
const [playersSettings, setPlayerSettings] = createSignal<PlayerSettings[]>([]);
let myIndex = 0;
let gameSeed = 0;

export function NetGameLobby(props: NetGameLobbyProps) {
    /* Signals and properties */
    const [clientState, setClientState] = createSignal({
        id: props.socket.id,
        name: "default",
        disconnected: false,
        // TODO: invertSteerOnReverse
    });

    /* Methods and callbacks */
    const updatePlayers = (gameState: NetGameState) => {
        const playerData: PlayerSettings[] = [];
        gameState.clients.forEach((c, i) => {
            if (c.id === clientState().id) {
                myIndex = i;

                if (c.disconnected) {
                    // TODO: should quit lobby completely
                    // TODO: navigate to
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

    const joinGame = (gameId: string) => {
        props.socket.emit("lobbyEntered", gameId, clientState());
    };

    /* onMount, onCleanup */
    onMount(() => {
        props.socket.on("lobbyUpdated", (gameState: NetGameState) => {
            updatePlayers(gameState);
        });

        props.socket.on("gameError", (message: string) => {
            // TODO: props.setGameJoined(false); // Go back to game picker
            alert(message);
        });

        props.socket.on(
            "gameStarted",
            (gameState: NetGameState, seed: number) => {
                updatePlayers(gameState);
                gameSeed = seed;
                // TODO: navigate to
                // TODO: rest of setup
            },
        );

        if (props.isSelfHosting) {
            // When lobby is created, join it
            props.socket.on("lobbyCreated", () => {
                joinGame(clientState().id);
            });

            // Request lobby
            props.socket.emit("lobbyRequested", props.socket.id);
        } else {
            // Lobby already exists, join it
            joinGame(props.gameId);
        }
    });

    onCleanup(() => {
        // TODO: clear socket callbacks?
    });

    /* HTML */
    return (
        <Routes>
            <Route path={"/game"}>
                <Game
                    settings={playersSettings}
                    playerCount={playersSettings().length}
                    // TODO: Refactor net game
                    gameSeed={gameSeed}
                    socket={props.socket}
                    myIndex={myIndex}
                />
            </Route>
            <Route path={"/"} fallback={true}>
                <NetGameLobbyView
                    isSelfHosting={props.isSelfHosting}
                    socket={props.socket}
                    clientState={clientState}
                />
            </Route>
        </Routes>
    );
}

function NetGameLobbyView(props: {
    isSelfHosting: boolean;
    socket: TinywarsSocket;
    clientState: Accessor<ClientState>;
}) {
    return (
        <>
            <h2 class="title">NetGameLobby</h2>
            <div id="PlayerSettingsCardsWrapper">
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
            </div>

            <Switch>
                <Match when={props.isSelfHosting}>
                    <span
                        classList={{
                            disabled_button: playersSettings().length < 2,
                        }}
                    >
                        <Link href="network/game">
                            {/*
                             onclick={() => {
                            props.socket.emit(
                                "lobbyCommited",
                                props.clientState().id,
                            );
                        }} */}
                            Start Game
                        </Link>
                    </span>
                </Match>
            </Switch>
        </>
    );
}
