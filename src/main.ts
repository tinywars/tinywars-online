/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { debounce } from "lodash";
import { App } from "./app/app";
import "./style.css";
import { AppView } from "./view/app-view";
import { AppViewCanvas } from "./view-canvas/app-view";
import { AnimationFrame } from "./utility/animation";
import { PlayerSettings } from "./game/player-settings";
import { GameSettings } from "./game/game-settings";

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

const playerSettings: PlayerSettings[] = [
    {
        name: "red",
        invertSteeringOnReverse: true,
    },
    {
        name: "green",
        invertSteeringOnReverse: false,
    },
    {
        name: "blue",
        invertSteeringOnReverse: false,
    },
    {
        name: "yellow",
        invertSteeringOnReverse: false,
    },
];

const gameSettings: GameSettings = {
    SCREEN_WIDTH: 1280,
    SCREEN_HEIGHT: (1280 / 4) * 3,
    ANIMATION_FPS: 2,
    TIME_TILL_RESTART: 3,
    PLAYER_SETTINGS: playerSettings,
    DISPLAY_PLAYER_NAMES: true,
    PRNG_SEED: Date.now(),
    // Spawn settings
    PLAYER_COUNT: 3,
    NPC_COUNT: 1,
    ROCK_COUNT: 4,
    PLAYER_INITIAL_HEALTH: 3,
    PLAYER_INITIAL_ENERGY: 2,
    PLAYER_MAX_ENERGY: 4,
    // AI Settings
    AI_MAX_SHOOT_DELAY: 1.5,
    AI_MIN_SHOOT_DELAY: 0.5,
    // Simulation settings
    //   Player
    PLAYER_FORWARD_SPEED: 250,
    PLAYER_ROTATION_SPEED: 200,
    PLAYER_ENERGY_RECHARGE_SPEED: 0.5,
    PLAYER_MASS: 10,
    //   Projectile
    PROJECTILE_SPEED: 500,
    PROJECTILE_DAMAGE: 1,
    PROJECTILE_ENABLE_TELEPORT: true,
    PROJECTILE_MASS: 5,
    //   Obstacle
    OBSTACLE_MAX_SPEED: 375,
    OBSTACLE_HIT_DAMAGE: 10,
    OBSTACLE_MASS: 15,
};

const hudFrames = {
    healthbar: new AnimationFrame(247, 165, 12, 4),
    energybar: new AnimationFrame(247, 206, 7, 4),
};

const app = new App(keyboardState, animations, gameSettings);
app.start(FPS);

const appView = USE_NATIVE_RENDERER
    ? new AppViewCanvas(
          app,
          document.querySelector<HTMLCanvasElement>("#RenderCanvas")!,
          hudFrames,
      )
    : new AppView(app, document.body.querySelector("#app")!);
appView.scale();

window.onresize = debounce(() => {
    appView.scale();
}, 200);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).app = app;
