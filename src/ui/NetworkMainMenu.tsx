import { Link, Route, Routes } from "@gh0st-work/solid-js-router";
import { TinywarsSocket } from "../networking/types";
import { NetGameLobby } from "./lobby/NetGameLobby";
import { NetGameBrowserPicker } from "./NetGameBrowserPicker";

export function NetworkMainMenu(props: { socket: TinywarsSocket }) {
    return (
        <Routes>
            <Route path={"/lobby"}>
                <NetGameLobby
                    socket={props.socket}
                    isSelfHosting={true}
                    gameId={""}
                />
            </Route>
            <Route path={"/list"}>
                <NetGameBrowserPicker socket={props.socket} />
            </Route>
            <Route path={"/"} fallback={true}>
                <NetworkMainMenuView />
            </Route>
        </Routes>
    );
}

function NetworkMainMenuView() {
    return (
        <>
            <h2 class="title">Network game</h2>
            <div id="MainMenu">
                <Link href="network/lobby" class="menu_button">
                    Host game
                </Link>
                <Link href="network/list" class="menu_button">
                    Browse games
                </Link>
                <Link href="/" class="menu_button">
                    Back to menu
                </Link>
            </div>
        </>
    );
}
