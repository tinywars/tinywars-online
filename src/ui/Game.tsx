import { Accessor, onCleanup, onMount, Setter } from "solid-js";
import { AppRunner } from "../app/app-runner";
import { PlayerSettings } from "../game/player-settings";
import {
    CreateGameEventEmitter,
    CreateJukebox,
    CreateSoundPlayer,
    init
} from "../main";

interface GameProps {
    settings: Accessor<PlayerSettings[]>;
    playerCount: Accessor<number>;
    setIsGameShown: Setter<boolean>;
}

export function Game(props: GameProps) {
    const soundPlayer = CreateSoundPlayer();
    const jukebox = CreateJukebox();
    const gameEventEmitter = CreateGameEventEmitter(soundPlayer, jukebox);
    //const socket = CreateSocket();
    const keyboardState: Record<string, boolean> = {};
    let appRunner: AppRunner | undefined;

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
            props.playerCount(),
            props.settings(),
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
        <div>
            <button
                class="exitGameButton"
                onClick={() => {
                    props.setIsGameShown(false);
                }}
            >
                EXIT
            </button>
            <canvas id="RenderCanvas"></canvas>
        </div>
    );
}
