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

const gameSettings = {
    SCREEN_WIDTH: 1280,
    SCREEN_HEIGHT: (1280 / 4) * 3,
    ANIMATION_FPS: 2,
    TIME_TILL_RESTART: 3,
    PLAYER_NAMES: ["red", "green", "blue", "yellow"],
    DISPLAY_PLAYER_NAMES: true,
    // Spawn settings
    PLAYER_COUNT: 2,
    NPC_COUNT: 0,
    ROCK_COUNT: 4,
    PLAYER_INITIAL_HEALTH: 3,
    PLAYER_INITIAL_ENERGY: 2,
    PLAYER_MAX_ENERGY: 4,
    // Simulation settings
    //   Player
    PLAYER_FORWARD_SPEED: 500,
    PLAYER_ROTATION_SPEED: 250,
    PLAYER_ENERGY_RECHARGE_SPEED: 0.5,
    PLAYER_MASS: 10,
    //   Projectile
    PROJECTILE_SPEED: 1000,
    PROJECTILE_DAMAGE: 1,
    PROJECTILE_ENABLE_TELEPORT: false,
    PROJECTILE_MASS: 1.5,
    //   Obstacle
    OBSTACLE_MAX_SPEED: 750,
    OBSTACLE_HIT_DAMAGE: 10,
    OBSTACLE_MASS: 15,
};

const app = new App(keyboardState, animations, gameSettings);
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
