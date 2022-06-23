/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { debounce } from "lodash";
import { io, Socket } from "socket.io-client";
import musicTrack1 from "../assets/music/track1.ogg";
import musicTrack2 from "../assets/music/track2.ogg";
import musicTrack3 from "../assets/music/track3.ogg";
import musicTrack4 from "../assets/music/track4.ogg";
import musicTrack5 from "../assets/music/track5.ogg";
import soundTurboUrl from "../assets/sounds/boost1.wav";
import soundExplosionUrl from "../assets/sounds/explosion.wav";
import soundLaser1Url from "../assets/sounds/laser1.wav";
import soundLaser2Url from "../assets/sounds/laser3.wav";
import soundPowerupPickedUrl from "../assets/sounds/powerup.wav";
import soundRockHitUrl from "../assets/sounds/rockhit.wav";
import soundRockHit2Url from "../assets/sounds/rockhit2.wav";
import soundShipHitUrl from "../assets/sounds/shiphit.wav";
import soundWreckHitUrl from "../assets/sounds/shiphit2.wav";
import { ClientEvents, ClientState, ServerEvents } from "../backend/src/events";
import { App } from "./app/app";
import { GameEventEmitter } from "./events/event-emitter";
import { GameSettings } from "./game/game-settings";
import { KeyCode } from "./game/key-codes";
import { PlayerControls, PlayerSettings } from "./game/player-settings";
import "./style.css";
import { AnimationFrame } from "./utility/animation";
import { Jukebox } from "./utility/jukebox";
import { GamepadAxis, GamepadButton } from "./utility/physical-controller";
import { PRNG } from "./utility/prng";
import { SoundPlayer } from "./utility/sound-player";
import { AppViewCanvas } from "./view-canvas/app-view";

const clientSettings: ClientState = {
    id: PRNG.randomInt(),
    name: "ReadyPlayerOne",
};

const socket: Socket<ServerEvents, ClientEvents> = io("http://localhost:10666");

socket.on("connect", () => {
    socket.emit("clientChanged", clientSettings);
});

socket.on("lobbyUpdated", (state) => {
    console.log(state);
});

const FPS = 60;

const jukebox = new Jukebox([
    musicTrack1,
    musicTrack2,
    musicTrack3,
    musicTrack4,
    musicTrack5,
]);
jukebox.setVolume(0.5);

enum Sounds {
    Laser1 = "Laser1",
    Laser2 = "Laser2",
    ShipHit = "ShipHit",
    RockHit = "RockHit",
    WreckHit = "WreckHit",
    ObstacleBounce = "ObstacleBounce",
    Explosion = "4",
    Powerup = "5",
    Turbo = "6",
}

const soundPlayer = new SoundPlayer({
    [Sounds.Laser1]: soundLaser1Url,
    [Sounds.Laser2]: soundLaser2Url,
    [Sounds.ShipHit]: soundShipHitUrl,
    [Sounds.RockHit]: soundRockHitUrl,
    [Sounds.WreckHit]: soundWreckHitUrl,
    [Sounds.ObstacleBounce]: soundRockHit2Url,
    [Sounds.Explosion]: soundExplosionUrl,
    [Sounds.Powerup]: soundTurboUrl,
    [Sounds.Turbo]: soundPowerupPickedUrl,
});

const gameEventEmitter = new GameEventEmitter();
gameEventEmitter
    .addListener("ProjectileSpawned", (playerId) => {
        soundPlayer.playSound(
            playerId % 2 == 0 ? Sounds.Laser1 : Sounds.Laser2,
        );
    })
    .addListener("PlayerWasHit", () => {
        soundPlayer.playSound(Sounds.ShipHit);
    })
    .addListener("RockWasHit", () => {
        soundPlayer.playSound(Sounds.RockHit);
    })
    .addListener("PlayerWasDestroyed", () => {
        soundPlayer.playSound(Sounds.Explosion);
    })
    .addListener("PowerupPickedUp", () => {
        soundPlayer.playSound(Sounds.Powerup);
    })
    .addListener("PlayerUsedTurbo", () => {
        soundPlayer.playSound(Sounds.Turbo);
    })
    .addListener("WreckWasHit", () => {
        soundPlayer.playSound(Sounds.WreckHit);
    })
    .addListener("ObstacleBounced", () => {
        soundPlayer.playSound(Sounds.ObstacleBounce);
    })
    .addListener("GameStarted", () => {
        jukebox.playNextSong();
    })
    .addListener("GameStopped", () => {
        jukebox.stop();
    });

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
    PRNG_SEED: 0,
    FIXED_FRAME_TIME: 1 / FPS,
    // Spawn settings
    PLAYER_COUNT: 2,
    NPC_COUNT: 0,
    ROCK_COUNT: 4,
    PLAYER_INITIAL_HEALTH: 3,
    PLAYER_INITIAL_ENERGY: 2,
    PLAYER_MAX_ENERGY: 4,
    // AI Settings
    AI_DUMBNESS: [0, 0.33, 0.66, 1],
    AI_SHOOT_DELAY: 0.2,
    AI_HEALTH_SCORE_WEIGHT: 100, // how much each health point scores in pickTargetPlayer method
    AI_HEALTH_POWERUP_SCORE_WEIGHT: 150,
    AI_POWERUP_ACTIONABLE_RADIUS: 400,
    AI_POWERUP_IGNORE_DELAY: 0.85,
    AI_MAX_AIM_ERROR: 25, // degrees
    AI_AIM_ERROR_DECREASE_SPEED: 0.25, // fully decreased after 4 seconds
    AI_MAX_COLLISION_DODGE_ERROR: 0.75, // seconds
    AI_COLLISION_DODGE_ERROR_DECREASE_SPEED: 0.33,
    AI_MAX_COLLISION_PANIC_RADIUS: 20, // px
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
    PROJECTILE_ENABLE_TELEPORT: false,
    PROJECTILE_MASS: 5,
    PROJECTILE_SELF_DESTRUCT_TIMEOUT: 10,
    //   Obstacle
    OBSTACLE_MAX_SPEED: 375,
    OBSTACLE_HIT_DAMAGE: 100,
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

const app = new App(gameEventEmitter, keyboardState, animations, gameSettings);
app.start();

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
