/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { debounce } from "lodash";
import { io } from "socket.io-client";
import musicTrack1 from "../assets/music/track1.ogg";
import musicTrack2 from "../assets/music/track2.ogg";
import musicTrack3 from "../assets/music/track3.ogg";
import musicTrack4 from "../assets/music/track4.ogg";
import musicTrack5 from "../assets/music/track5.ogg";
import soundTurboUrl from "../assets/sounds/boost1.wav";
import soundExplosionUrl from "../assets/sounds/explosion.wav";
import soundLaser1Url from "../assets/sounds/laser1.wav";
import soundLaser2Url from "../assets/sounds/laser3.wav";
import soundPowerupPickedUrl from "../assets/sounds/powerup3.wav";
import soundRockHitUrl from "../assets/sounds/rockhit.wav";
import soundRockHit2Url from "../assets/sounds/rockhit2.wav";
import soundShipHitUrl from "../assets/sounds/shiphit.wav";
import soundWreckHitUrl from "../assets/sounds/shiphit2.wav";
import { BACKEND_PORT } from "../backend/src/settings";
import { ClientState } from "../backend/src/types/client-state";
import { NetGameState } from "../backend/src/types/game-state";
import { App } from "./app/app";
import { LocalAppRunner } from "./app/local-app-runner";
import { NetAppRunner } from "./app/net-app-runner";
import { Controller } from "./controllers/controller";
import { ControllerFactory } from "./controllers/controller-factory";
import { SimpleController } from "./controllers/simple-controller";
import { GameEventEmitter } from "./events/event-emitter";
import { EffectType } from "./game/effect";
import { GameSettings } from "./game/game-settings";
import {
    PLAYER1_DEFAULT_CONTROLS,
    PLAYER2_DEFAULT_CONTROLS,
    PLAYER3_DEFAULT_CONTROLS,
    PLAYER4_DEFAULT_CONTROLS,
    PlayerSettings
} from "./game/player-settings";
import { TinywarsSocket } from "./networking/types";
import "./style.css";
import { AnimationFrame } from "./utility/animation";
import { Jukebox } from "./utility/jukebox";
import { PRNG } from "./utility/prng";
import { SoundPlayer } from "./utility/sound-player";
import { AppViewCanvas } from "./view-canvas/app-view";

PRNG.setSeed(Date.now());

function startNetGame(socket: TinywarsSocket, gameCode: string) {
    socket.emit("lobbyCommited", gameCode);
}

// Generate random player state
// this will be customizable in menu
const hardcodedRandomPlayerNames = [
    "ReadyPlayerOne",
    "doomista",
    "rand'o",
    "PapoochCZ",
];
let clientState: ClientState;

// Instantiate socket connection
// Dev: assume that backend lives on the same machine as frontend
const socket: TinywarsSocket = io(
    `http://${window.location.hostname}:${BACKEND_PORT}`,
    { transports: ["websocket"] },
);

socket.on("connect", () => {
    console.log("Connected to backend");
    console.log(window.location.pathname);

    clientState = {
        id: socket.id,
        name: PRNG.randomItem(hardcodedRandomPlayerNames),
        disconnected: false,
    };

    console.log(clientState);

    if (window.location.pathname.startsWith("/net/connect/")) {
        const gameCode = window.location.pathname.slice("/net/connect/".length);
        socket.emit("lobbyEntered", gameCode, clientState);
    } else if (window.location.pathname.startsWith("/net/host")) {
        socket.emit("lobbyRequested", clientState.id);
    }
});

socket.on("connect_error", (err) => {
    console.error(err);
    //alert(`Error: ${err.name}:${err.message}`);
});

socket.on("gameError", (message: string) => {
    alert("GameError: " + message);
});

socket.on("lobbyUpdated", (state) => {
    console.log(state);
});

socket.on("lobbyCreated", () => {
    console.log(
        `Lobby created. Other peers can connect by going to this address: http://${window.location.hostname}:${window.location.port}/net/connect/${clientState.id}`,
    );
    socket.emit("lobbyEntered", clientState.id, clientState);
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
    [Sounds.Powerup]: soundPowerupPickedUrl,
    [Sounds.Turbo]: soundTurboUrl,
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

function ComputeAnimationFrames(
    startX: number,
    startY: number,
    width: number,
    height: number,
    frameCount: number,
): AnimationFrame[] {
    const result: AnimationFrame[] = [];

    for (let i = 0; i < frameCount; i++) {
        result.push(new AnimationFrame(startX + i * 41, startY, width, height));
    }

    return result;
}

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
    effects: {
        playerBoom: ComputeAnimationFrames(1, 288, 40, 40, 5),
        powerupPickup: ComputeAnimationFrames(1, 329, 40, 40, 4),
        projectileBoom: ComputeAnimationFrames(1, 370, 14, 14, 4),
    },
};

const playerSettings: PlayerSettings[] = [
    {
        name: "red",
        invertSteeringOnReverse: true,
        controls: PLAYER1_DEFAULT_CONTROLS,
    },
    {
        name: "green",
        invertSteeringOnReverse: false,
        controls: PLAYER2_DEFAULT_CONTROLS,
    },
    {
        name: "blue",
        invertSteeringOnReverse: false,
        controls: PLAYER3_DEFAULT_CONTROLS,
    },
    {
        name: "yellow",
        invertSteeringOnReverse: false,
        controls: PLAYER4_DEFAULT_CONTROLS,
    },
];

const gameSettings: GameSettings = {
    SCREEN_WIDTH: 1280,
    SCREEN_HEIGHT: (1280 / 4) * 3,
    COMMON_ANIMATION_FPS: 2,
    EFFECT_ANIMATION_FPS: 16,
    TIME_TILL_RESTART: 3,
    PLAYER_SETTINGS: playerSettings,
    DISPLAY_PLAYER_NAMES: true,
    PRNG_SEED: 0,
    FIXED_FRAME_TIME: 1 / FPS,
    // Spawn settings
    PLAYER_COUNT: 4,
    NPC_COUNT: 4,
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

const shouldStartNetGame = window.location.pathname.startsWith("/net");

function effectTypeToAnimationName(name: EffectType): string {
    switch (name) {
        case EffectType.PlayerExplosion:
            return "playerBoom";
        case EffectType.ProjectileExplosion:
            return "projectileBoom";
        case EffectType.PowerupPickup:
            return "powerupPickup";
    }
}

if (!shouldStartNetGame) {
    const HUMAN_PLAYER_COUNT =
        gameSettings.PLAYER_COUNT - gameSettings.NPC_COUNT;
    const controllers: Controller[] = [];

    for (let i = 0; i < HUMAN_PLAYER_COUNT; i++)
        controllers.push(
            ControllerFactory.createPhysicalController(
                i,
                playerSettings[i],
                keyboardState,
            ),
        );

    for (let i = HUMAN_PLAYER_COUNT; i < gameSettings.PLAYER_COUNT; i++) {
        const aiController = new SimpleController();
        controllers.push(aiController);
    }

    const app = new App(
        gameEventEmitter,
        animations,
        gameSettings,
        controllers,
        effectTypeToAnimationName,
    );
    const runner = new LocalAppRunner(app);
    runner.run(FPS);

    const appView = new AppViewCanvas(
        app,
        document.querySelector<HTMLCanvasElement>("#RenderCanvas")!,
        hudFrames,
    );
    appView.scale();

    window.onresize = debounce(() => {
        appView.scale();
    }, 200);
}

socket.on("gameStarted", (gameState: NetGameState, seed: number) => {
    console.log(`Game starting... (seed ${seed})`);
    let myIndex = 0;
    gameState.clients.forEach((c, i) => {
        if (c.id === clientState.id) myIndex = i;
    });

    const playerSettings: PlayerSettings[] = [];
    gameState.clients.forEach((c, i) => {
        playerSettings.push({
            name: c.name,
            invertSteeringOnReverse: false,
            controls:
                i === myIndex
                    ? PLAYER1_DEFAULT_CONTROLS
                    : PLAYER4_DEFAULT_CONTROLS, // this is just dummy value, won't be used
        });
    });

    gameSettings.PLAYER_COUNT = gameState.clients.length;
    gameSettings.NPC_COUNT = 0;
    gameSettings.PLAYER_SETTINGS = playerSettings;
    gameSettings.PRNG_SEED = seed;

    const controllers: SimpleController[] = [];
    for (let i = 0; i < gameState.clients.length; i++)
        controllers.push(new SimpleController());

    const myController = ControllerFactory.createPhysicalController(
        1,
        playerSettings[myIndex],
        keyboardState,
    );

    const app = new App(
        gameEventEmitter,
        animations,
        gameSettings,
        controllers,
        effectTypeToAnimationName,
    );
    const runner = new NetAppRunner(app, socket, controllers, myController);
    runner.run(FPS);

    const appView = new AppViewCanvas(
        app,
        document.querySelector<HTMLCanvasElement>("#RenderCanvas")!,
        hudFrames,
    );
    appView.scale();

    window.onresize = debounce(() => {
        appView.scale();
    }, 200);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
//(window as any).app = app;
(window as any).startNetGame = () => {
    startNetGame(socket, clientState.id);
};
