/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { App } from "./app-states/app";
import { AppStateGame } from "./app-states/app-state-game";
import { KeyCode } from "./game/key-codes";
import "./style.css";
import { KeyboardController } from "./utility/keyboard-controller";
import { Vector } from "./utility/vector";
import { AppView } from "./view/app-view";

const FPS = 60;

const keyboardState: Record<string, boolean> = {};
document.onkeydown = (e) => {
    console.log("OnKeyDown: " + e.code);
    keyboardState[e.code] = true;
};
document.onkeyup = (e) => {
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

const app = new App();
app.pushState(new AppStateGame(app, controller));
app.run(FPS);

const appView = new AppView(app, document.body.querySelector("#app")!);
appView.scale();

window.addEventListener("resize", () => {
    appView.scale();
});
