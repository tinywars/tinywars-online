/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { App } from "./app-states/app";
import { AppStateGame } from "./app-states/app-state-game";
import { KeyCode } from "./game/key-codes";
import "./style.css";
import { KeyboardController } from "./utility/keyboard-controller";
import { Vector } from "./utility/vector";
import * as constants from "./constants";

// TODO: environment setup

const canvas = document.querySelector<HTMLCanvasElement>("#RenderCanvas")!;
if (canvas === null) throw Error("#RenderCanvas not found")
const context2d = canvas.getContext("2d")!

function ResizeCanvas() {
    if (canvas === null) return;

    let width =  window.innerWidth;
    let height = window.innerHeight;

    // We want to compute maximum possible 4:3 canvas
    if (width / 4 < height / 3) {
        height = width * 3 / 4;
    }
    else {
        width = height * 4 / 3;
    }

    canvas.width = width;
    canvas.height = height;

    canvas.getContext("2d")!.scale(width / constants.GAME_SCREEN_WIDTH, height / constants.GAME_SCREEN_HEIGHT);

    console.log("Screen resolution: " + new Vector(width, height).toString());

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
app.run();
