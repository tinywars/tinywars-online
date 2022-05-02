/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { debounce } from "lodash";
import { App } from "./app-states/app";
import { AppStateGame } from "./app-states/app-state-game";
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
        idle: [new AnimationFrame(1, 1, 40, 40)],
        hit: [new AnimationFrame(83, 0, 40, 40)],
    },
    player1: {
        idle: [new AnimationFrame(1, 42, 40, 40)],
        hit: [new AnimationFrame(83, 42, 40, 40)],
    },
    player2: {
        idle: [new AnimationFrame(1, 83, 40, 40)],
        hit: [new AnimationFrame(83, 83, 40, 40)],
    },
    player3: {
        idle: [new AnimationFrame(1, 124, 40, 40)],
        hit: [new AnimationFrame(83, 124, 40, 40)],
    },
    projectile: {
        idle: [new AnimationFrame(206, 165, 4, 10)],
    },
    rock: {
        idle0: [new AnimationFrame(1, 165, 40, 40)],
        idle1: [new AnimationFrame(1, 206, 40, 40)],
        wreck0: [new AnimationFrame(42, 0, 40, 40)],
        wreck1: [new AnimationFrame(42, 42, 40, 40)],
        wreck2: [new AnimationFrame(42, 83, 40, 40)],
        wreck3: [new AnimationFrame(42, 124, 40, 40)],
    },
};

const app = new App();
app.pushState(new AppStateGame(app, keyboardState, animations));
app.run(FPS);

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
