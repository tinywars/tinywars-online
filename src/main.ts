/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { debounce } from "lodash";
import { App } from "./app-states/app";
import { AppStateGame } from "./app-states/app-state-game";
import "./style.css";
import { AppView } from "./view/app-view";
import { Controller } from "./utility/controller";

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
window.addEventListener("gamepadconnected", function(e) {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
});

console.log("App init");

const app = new App();
app.pushState(new AppStateGame(app, keyboardState));
app.run(FPS);

const appView = new AppView(app, document.body.querySelector("#app")!);
appView.scale();

window.onresize = debounce(() => {
    appView.scale();
}, 200);
