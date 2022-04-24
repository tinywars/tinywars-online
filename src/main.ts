import "./style.css";
import { GameContext } from "./game/game-context";
import { EventQueue } from "./events/event-queue";
import { DebugEvent } from "./events/game-event";
import { Vector } from "./utility/vector";
import { KeyCode } from "./game/key-codes";

import { App } from "./app-states/app";
import { AppStateGame } from "./app-states/app-state-game";
import { KeyboardController } from "./utility/keyboard-controller";

const FPS = 60;

// TODO: environment setup

const html = document.querySelector<HTMLDivElement>("#app");
html.innerHTML = `
  <canvas id="RenderCanvas" width=100 height=100></canvas>
`;

console.log("Canvas constructed");

const canvas = document.querySelector<HTMLCanvasElement>("#RenderCanvas");
const context2d = canvas.getContext("2d");

function ResizeCanvas() {
    if (canvas === null) return;

    let width = isNaN(window.innerWidth) ? window.clientWidth : window.innerWidth;
    let height = isNaN(window.innerHeight) ? window.clientHeight : window.innerHeight;

    // We want to compute maximum possible 4:3 canvas
    if (width / 4 < height / 3) {
        height = width * 3 / 4;
    }
    else {
        width = height * 4 / 3;
    }

    canvas.width = width;
    canvas.height = height;

    canvas.getContext("2d").scale(width / 1440, height / 1080);

    console.log("Screen resolution: " + new Vector(width, height).toString());

    // TODO: then also set the global scale factor for the canvas so the game resolution remains the same no matter what the render resolution will be
}
ResizeCanvas();

// FIXME: following does not work at all, no matter if I use body or document
const body = document.getElementsByTagName("body")[0];
["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "msfullscreenchange", "resize"].forEach(
    eventType => body.addEventListener(eventType, ResizeCanvas, false)
);
body.focus();

const keyboardState: Record<string, boolean> = {};
document.onkeydown = e => {
    console.log("OnKeyDown: " + e.code);
    keyboardState[e.code] = true;
};
document.onkeyup = e => {
    console.log("OnKeyUp: " + e.code);
    keyboardState[e.code] = false;
};

const controller = new KeyboardController(keyboardState);
controller.bindKey("KeyW", KeyCode.Up);
controller.bindKey("KeyA", KeyCode.Left);
controller.bindKey("KeyS", KeyCode.Down);
controller.bindKey("KeyD", KeyCode.Right);

// TODO: resizing

console.log("App init");

const app = new App(context2d);
app.pushState(new AppStateGame(app, controller));
app.run(FPS);

/*
const app = document.querySelector<HTMLDivElement>("#app")!;
const a = {
    b: 1,
    c: 2,
};

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`;
*/
