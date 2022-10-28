import { Link, Route, Routes } from "@gh0st-work/solid-js-router";
import { createSignal, onCleanup, onMount } from "solid-js";
import { NetGameInfo } from "../../backend/src/types/game-info";
import { TinywarsSocket } from "../networking/types";
import { NetGameList } from "./components/NetGameList";

export function NetGameBrowserPicker(props: { socket: TinywarsSocket }) {
    /* Signals and properties */
    let gameId = "";

    /* Methods and callbacks */

    /* onMount, onCleanup */
    onMount(() => {
        console.log("NetGameBrowserPicker:onMount");
    });

    onCleanup(() => {
        console.log("NetGameBrowserPicker:onCleanup");
    });

    /* HTML */
    return (
        <Routes>
            <Route path={"/lobby2"}>AAAA</Route>
            <Route path={"/"} fallback={true}>
                <NetGameBrowserPickerView
                    socket={props.socket}
                    onGameJoined={(id: string) => {
                        gameId = id;
                    }}
                />
            </Route>
        </Routes>
    );
}

function NetGameBrowserPickerView(props: {
    socket: TinywarsSocket;
    onGameJoined: (id: string) => void;
}) {
    const [gameList, setGameList] = createSignal<NetGameInfo[]>([]);

    props.socket.on("gameListCollected", (list: NetGameInfo[]) => {
        setGameList(list);
    });

    return (
        <>
            <h2 class="title">Browse games</h2>
            <NetGameList
                gameInfos={gameList}
                onJoinClick={props.onGameJoined}
                onRefresh={() => {
                    props.socket.emit("gameListRequested");
                }}
            />
            <Link href="/" class="menu_button">
                Back to menu
            </Link>
        </>
    );
}
