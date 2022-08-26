import { Component, onCleanup, onMount } from "solid-js";
import { AppRunner } from "../app/app-runner";
import {
    CreateGameEventEmitter,
    CreateJukebox,
    CreateSoundPlayer,
    init
} from "../main";

export const Game: Component = () => {
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
        appRunner = init(gameEventEmitter, keyboardState);
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
            <canvas id="RenderCanvas"></canvas>
            <div>GAME</div>
        </div>
    );
};
