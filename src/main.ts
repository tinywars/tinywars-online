/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { debounce } from "lodash";
import { App } from "./app/app";
import "./style.css";
import { AppViewCanvas } from "./view-canvas/app-view";
import { AnimationFrame } from "./utility/animation";
import { PlayerControls, PlayerSettings } from "./game/player-settings";
import { GameSettings } from "./game/game-settings";
import { KeyCode } from "./game/key-codes";
import { GamepadAxis, GamepadButton } from "./utility/physical-controller";

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
    powerup: {
        idle0: [new AnimationFrame(1, 247, 20, 20)],
        idle1: [new AnimationFrame(42, 247, 20, 20)],
        idle2: [new AnimationFrame(83, 247, 20, 20)],
        idle3: [new AnimationFrame(124, 247, 20, 20)],
        idle4: [new AnimationFrame(165, 247, 20, 20)],
        idle5: [new AnimationFrame(206, 247, 20, 20)],
        idle6: [new AnimationFrame(247, 247, 20, 20)],
    },
};

const player1controls: PlayerControls = {
    forward: {
        code: KeyCode.Up,
        key: "KeyW",
        button: GamepadButton.RTrigger,
    },
    backward: {
        code: KeyCode.Down,
        key: "KeyS",
        button: GamepadButton.LTrigger,
    },
    steerLeft: {
        code: KeyCode.Left,
        key: "KeyA",
        button: GamepadButton.DpadLeft,
    },
    steerRight: {
        code: KeyCode.Right,
        key: "KeyD",
        button: GamepadButton.DpadRight,
    },
    shoot: {
        code: KeyCode.Shoot,
        key: "KeyR",
        button: GamepadButton.X,
    },
    action: {
        code: KeyCode.Action,
        key: "KeyT",
        button: GamepadButton.A,
    },
    steerAxis: GamepadAxis.LHorizontal,
};

const player2controls: PlayerControls = {
    forward: {
        code: KeyCode.Up,
        key: "KeyI",
        button: GamepadButton.A,
    },
    backward: {
        code: KeyCode.Down,
        key: "KeyK",
        button: GamepadButton.B,
    },
    steerLeft: {
        code: KeyCode.Left,
        key: "KeyJ",
        button: GamepadButton.DpadLeft,
    },
    steerRight: {
        code: KeyCode.Right,
        key: "KeyL",
        button: GamepadButton.DpadRight,
    },
    shoot: {
        code: KeyCode.Shoot,
        key: "KeyP",
        button: GamepadButton.RTrigger,
    },
    action: {
        code: KeyCode.Action,
        key: "KeyO",
        button: GamepadButton.LTrigger,
    },
    steerAxis: GamepadAxis.LHorizontal,
};

const player3controls: PlayerControls = {
    forward: {
        code: KeyCode.Up,
        key: "Numpad5",
        button: GamepadButton.RTrigger,
    },
    backward: {
        code: KeyCode.Down,
        key: "Numpad2",
        button: GamepadButton.LTrigger,
    },
    steerLeft: {
        code: KeyCode.Left,
        key: "Numpad1",
        button: GamepadButton.DpadLeft,
    },
    steerRight: {
        code: KeyCode.Right,
        key: "Numpad3",
        button: GamepadButton.DpadRight,
    },
    shoot: {
        code: KeyCode.Shoot,
        key: "Numpad9",
        button: GamepadButton.X,
    },
    action: {
        code: KeyCode.Action,
        key: "Numpad6",
        button: GamepadButton.A,
    },
    steerAxis: GamepadAxis.LHorizontal,
};

const player4controls: PlayerControls = {
    forward: {
        code: KeyCode.Up,
        key: "KeyG",
        button: GamepadButton.RTrigger,
    },
    backward: {
        code: KeyCode.Down,
        key: "KeyB",
        button: GamepadButton.LTrigger,
    },
    steerLeft: {
        code: KeyCode.Left,
        key: "KeyV",
        button: GamepadButton.DpadLeft,
    },
    steerRight: {
        code: KeyCode.Right,
        key: "KeyN",
        button: GamepadButton.DpadRight,
    },
    shoot: {
        code: KeyCode.Shoot,
        key: "Space",
        button: GamepadButton.X,
    },
    action: {
        code: KeyCode.Action,
        key: "KeyH",
        button: GamepadButton.A,
    },
    steerAxis: GamepadAxis.LHorizontal,
};

const playerSettings: PlayerSettings[] = [
    {
        name: "red",
        invertSteeringOnReverse: true,
        controls: player1controls,
    },
    {
        name: "green",
        invertSteeringOnReverse: false,
        controls: player2controls,
    },
    {
        name: "blue",
        invertSteeringOnReverse: false,
        controls: player3controls,
    },
    {
        name: "yellow",
        invertSteeringOnReverse: false,
        controls: player4controls,
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
    PLAYER_TURBO_FORWARD_SPEED: 400,
    PLAYER_ROTATION_SPEED: 200,
    PLAYER_ENERGY_RECHARGE_SPEED: 0.5,
    PLAYER_MASS: 10,
    //   Projectile
    PROJECTILE_SPEED: 500,
    PROJECTILE_DAMAGE: 1,
    PROJECTILE_ENABLE_TELEPORT: true,
    PROJECTILE_MASS: 5,
    PROJECTILE_SELF_DESTRUCT_TIMEOUT: 10,
    //   Obstacle
    OBSTACLE_MAX_SPEED: 375,
    OBSTACLE_HIT_DAMAGE: 10,
    OBSTACLE_MASS: 15,
    OBSTACLE_BOUNCE_SLOW_FACTOR: 0.8,
    //   Powerup
    POWERUP_MIN_SPAWN_DELAY: 5,
    POWERUP_MAX_SPAWN_DELAY: 10,
    POWERUP_SPAWN_CHANCE_DISTRIBUTION: [2, 5, 7], // Array of prefix sums of [ 2, 3, 2 ]
    POWERUP_SPAWN_CHANCE_DISTRIBUTION_SUM: 7, // sum f original distribution 2 + 3 + 2
    POWERUP_ROTATION_SPEED: 64,
};

const hudFrames = {
    healthbar: new AnimationFrame(247, 165, 12, 4),
    energybar: new AnimationFrame(247, 206, 7, 4),
};

const app = new App(keyboardState, animations, gameSettings);
app.start(FPS);

const appView = new AppViewCanvas(
    app,
    document.querySelector<HTMLCanvasElement>("#RenderCanvas")!,
    hudFrames,
);
appView.scale();

window.onresize = debounce(() => {
    appView.scale();
}, 200);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).app = app;
