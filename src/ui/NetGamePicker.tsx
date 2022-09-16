import { createSignal, Match, Switch } from "solid-js";
import { NetGameInfo } from "../../backend/src/types/game-info";
import { TinywarsSocket } from "../networking/types";
import { NetGameList } from "./NetGameList";
import { NetGameLobby } from "./NetGameLobby";

interface NetGamePickerProps {
    socket: TinywarsSocket;
}

export function NetGamePicker(props: NetGamePickerProps) {
    /* Signals and properties */
    const [clientState, setClientState] = createSignal({
        id: props.socket.id,
        name: "default",
        disconnected: false,
    });
    const [gameJoined, setGameJoined] = createSignal(false);
    const [gameList, setGameList] = createSignal<NetGameInfo[]>([]);
    let selfHosting = false;
    // TODO: invertSteerOnReverse

    /* Methods and callbacks */
    const connectToGame = (id: string) => {
        props.socket.emit("lobbyEntered", id, clientState());
        setGameJoined(true);
    };

    props.socket.on("gameListCollected", (list: NetGameInfo[]) => {
        setGameList(list);
    });

    props.socket.on("lobbyCreated", () => {
        // Always join self-hosted game
        connectToGame(clientState().id);
    });

    /* onMount, onCleanup */

    /* HTML */
    return (
        <Switch>
            <Match when={gameJoined()}>
                <NetGameLobby
                    socket={props.socket}
                    clientState={clientState}
                    setClientState={setClientState}
                    setGameJoined={setGameJoined}
                    isSelfHosting={selfHosting}
                />
            </Match>
            <Match when={!gameJoined()}>
                <h2>Edit player</h2>
                <input
                    type="text"
                    value={clientState().name}
                    onchange={(e) => {
                        const client = clientState();
                        client.name = e.currentTarget.value;
                        setClientState(client);

                        // TODO: emit server change
                    }}
                />
                <h2>Game list</h2>
                <NetGameList
                    gameInfos={gameList}
                    onJoinClick={connectToGame}
                    onRefresh={() => {
                        props.socket.emit("gameListRequested");
                    }}
                />
                <h2>Host game</h2>
                <button
                    onclick={() => {
                        selfHosting = true;
                        props.socket.emit("lobbyRequested", props.socket.id);
                    }}
                >
                    Host
                </button>
            </Match>
        </Switch>
    );
}
