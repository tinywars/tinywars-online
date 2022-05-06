/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { debounce } from "lodash";
import { App } from "./app/app";
import "./style.css";
import { AppView } from "./view/app-view";
import { AppViewCanvas } from "./view-canvas/app-view";
import { AnimationFrame } from "./utility/animation";

const FPS = 60;
const USE_NATIVE_RENDERER = true;

const keyboardState: Record<string, boolean> = {};
document.onkeydown = (e) => {
    console.log("OnKeyDown: " + e.code);
    keyboardState[e.code] = true;
};
document.onkeyup = (e) => {
    console.log("OnKeyUp: " + e.code);
    keyboardState[e.code] = false;
};
window.addEventListener("gamepadconnected", function (e) {
    console.log(
        "Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index,
        e.gamepad.id,
        e.gamepad.buttons.length,
        e.gamepad.axes.length,
    );
});

console.log("App init");

const animations = {
    player0: {
        idle: [new AnimationFrame(0, 0, 32, 32)],
        hit: [new AnimationFrame(32, 0, 32, 32)],
    },
    player1: {
        idle: [new AnimationFrame(32, 0, 32, 32)],
        hit: [new AnimationFrame(64, 0, 32, 32)],
    },
    player2: {
        idle: [new AnimationFrame(64, 0, 32, 32)],
        hit: [new AnimationFrame(96, 0, 32, 32)],
    },
    player3: {
        idle: [new AnimationFrame(96, 0, 32, 32)],
        hit: [new AnimationFrame(0, 0, 32, 32)],
    },
    projectile: {
        idle: [new AnimationFrame(128, 0, 4, 10)],
    },
    rock: {
        idle0: [new AnimationFrame(0, 36, 40, 40)],
        idle1: [new AnimationFrame(40, 36, 40, 40)],
        wreck0: [new AnimationFrame(0, 76, 40, 40)],
        wreck1: [new AnimationFrame(40, 76, 40, 40)],
        wreck2: [new AnimationFrame(80, 76, 40, 40)],
        wreck3: [new AnimationFrame(120, 76, 40, 40)],
    },
};

const app = new App(keyboardState, animations, {
    INTERNAL_SCREEN_WIDTH: 1280,
    INTERNAL_SCREEN_HEIGHT: (1280 / 4) * 3,
    PLAYER_COUNT: 2,
    AI_PLAYER_COUNT: 0,
    ANIMATION_FPS: 2,
    TIME_TILL_RESTART: 3,
});
app.start(FPS);

const appView = USE_NATIVE_RENDERER
    ? new AppViewCanvas(
          app,
          document.querySelector<HTMLCanvasElement>("#RenderCanvas")!,
      )
    : new AppView(app, document.body.querySelector("#app")!);
appView.scale();

window.onresize = debounce(() => {
    appView.scale();
}, 200);
