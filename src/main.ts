/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { debounce } from "lodash";
import { App } from "./app-states/app";
import { AppStateGame } from "./app-states/app-state-game";
import { KeyCode } from "./game/key-codes";
import "./style.css";
import { KeyboardController } from "./utility/keyboard-controller";
import { AppView } from "./view/app-view";
import { TestFastArray } from "./utility/fast-array";
import { Controller } from "./utility/controller";

const FPS = 60;
TestFastArray();

const keyboardState: Record<string, boolean> = {};
document.onkeydown = (e) => {
    console.log("OnKeyDown: " + e.code);
    keyboardState[e.code] = true;
};
document.onkeyup = (e) => {
    console.log("OnKeyUp: " + e.code);
    keyboardState[e.code] = false;
};

const controllers: Controller[] = [];
controllers.push(((keyboardState: Record<string, boolean>) => {
    const input = new KeyboardController(keyboardState);
    input.bindKey("KeyW", KeyCode.Up);
    input.bindKey("KeyA", KeyCode.Left);
    input.bindKey("KeyS", KeyCode.Down);
    input.bindKey("KeyD", KeyCode.Right);
    input.bindKey("KeyE", KeyCode.Shoot);
    input.bindKey("KeyR", KeyCode.Boost);
    return input;
})(keyboardState));

controllers.push(((keyboardState: Record<string, boolean>) => {
    const input = new KeyboardController(keyboardState);
    input.bindKey("KeyI", KeyCode.Up);
    input.bindKey("KeyJ", KeyCode.Left);
    input.bindKey("KeyK", KeyCode.Down);
    input.bindKey("KeyL", KeyCode.Right);
    input.bindKey("KeyO", KeyCode.Shoot);
    input.bindKey("KeyP", KeyCode.Boost);
    return input;
})(keyboardState));

console.log("App init");

const app = new App();
app.pushState(new AppStateGame(app, controllers));
app.run(FPS);

const appView = new AppView(app, document.body.querySelector("#app")!);
appView.scale();

window.onresize = debounce(() => {
    appView.scale();
}, 200);
