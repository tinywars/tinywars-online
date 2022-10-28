import { Link } from "@gh0st-work/solid-js-router";
import { Accessor, onCleanup, onMount } from "solid-js";
import { AppRunner } from "../../app/app-runner";
import { PlayerSettings } from "../../game/player-settings";
import {
    CreateGameEventEmitter,
    CreateJukebox,
    CreateSoundPlayer,
    init
} from "../../main";
import { TinywarsSocket } from "../../networking/types";

interface GameProps {
    settings: Accessor<PlayerSettings[]>;
    playerCount: number;
    gameSeed: number;
    socket?: TinywarsSocket;
    myIndex?: number;
}

export function Game(props: GameProps) {
    const soundPlayer = CreateSoundPlayer();
    const jukebox = CreateJukebox();
    const gameEventEmitter = CreateGameEventEmitter(soundPlayer, jukebox);
    const keyboardState: Record<string, boolean> = {};
    let appRunner: AppRunner | undefined;

    const isNetworkGame = !!props.socket;

    document.onkeydown = (e) => {
        keyboardState[e.code] = true;
    };
    document.onkeyup = (e) => {
        keyboardState[e.code] = false;
    };

    onMount(() => {
        console.log("Game:onMount");
        appRunner = init(
            gameEventEmitter,
            keyboardState,
            props.playerCount,
            props.settings(),
            props.gameSeed,
            props.socket,
            props.myIndex,
        );
    });

    onCleanup(() => {
        console.log("Game:onCleanup");

        if (appRunner !== undefined) {
            appRunner.release();
            appRunner = undefined;
        }

        window.onresize = null;
    });

    return (
        <div id="GameView">
            <canvas id="RenderCanvas"></canvas>

            <div id="GameSidebar">
                <Link
                    href={isNetworkGame ? "/network" : "/local"}
                    class="menu_button"
                >
                    Exit game
                </Link>
            </div>
        </div>
    );
}
