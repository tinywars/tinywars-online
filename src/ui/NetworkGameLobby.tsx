import { createSignal, onMount } from "solid-js";
import { NetGameInfo } from "../../backend/src/types/game-info";
import { PlayerSettings } from "../game/player-settings";
import { TinywarsSocket } from "../networking/types";
import { NetGameList } from "./NetGameList";

interface NetworkGameLobbyProps {
    socket: TinywarsSocket;
}

export function NetworkGameLobby(props: NetworkGameLobbyProps) {
    const [playerSettings, setPlayerSettings] = createSignal<PlayerSettings[]>(
        [],
    );
    const [playerCount, setPlayerCount] = createSignal(4);
    const [gameList, setGameList] = createSignal<NetGameInfo[]>([]);
    //    const [isGameShown, setIsGameShown] = createSignal(false);

    props.socket.on("gameListCollected", (list: NetGameInfo[]) => {
        setGameList(list);
    });

    onMount(() => {
        // todo
    });

    const clientState = {
        id: props.socket.id,
        name: "default",
        disconnected: false,
    };

    return (
        <div>
            <h2>Game list</h2>
            <NetGameList
                gameInfos={gameList}
                onJoinClick={(id: string) => {
                    props.socket.emit("lobbyEntered", id, clientState);
                }}
                onRefresh={() => {
                    props.socket.emit("gameListRequested");
                }}
            />
            <h2>Host game</h2>
            <button
                onclick={() => {
                    props.socket.emit("lobbyRequested", props.socket.id);
                }}
            >
                Host
            </button>
        </div>
    );
}
