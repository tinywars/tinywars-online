import { Component, onCleanup, onMount } from "solid-js";
import { init } from "../main";

export const Game: Component = () => {
    // TODO: enter logic
    console.log("Game");
    onMount(() => {
        console.log(init);
        init();
    });
    onCleanup(() => console.log("on cleanup"));

    return (
        <div>
            <canvas id="RenderCanvas"></canvas>
            <div>GAME</div>
        </div>
    );
};
