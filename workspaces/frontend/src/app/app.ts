import { AiBrain } from "../ai/ai-brain";
import { Controller } from "../controllers/controller";
import { SimpleController } from "../controllers/simple-controller";
import { GameEventEmitter } from "../events/event-emitter";
import { EventQueue } from "../events/event-queue";
import { eventSpawnPowerup } from "../events/game-event";
import { CollisionMediator } from "../game/collision-mediator";
import { Effect, EffectAnimationKey } from "../game/effect";
import { GameContext } from "../game/game-context";
import { GameSettings } from "../game/game-settings";
import { Obstacle, ObstacleAnimationKey } from "../game/obstacle";
import { Player, PlayerAnimationKey } from "../game/player";
import { Powerup, PowerupAnimationKey } from "../game/powerup";
import { Projectile, ProjectileAnimationKey } from "../game/projectile";
import {
    AnimationEngine,
    AnimationFrame,
    AnimationStates,
    GetAnimationKey
} from "../utility/animation";
import { FastArray } from "../utility/fast-array";
import { PRNG } from "../utility/prng";
import { Timer } from "../utility/timer";
import { Vector } from "../utility/vector";
import { Releasable } from "./releasable";

export type AnimationDB = {
    player0: AnimationStates<PlayerAnimationKey>;
    player1: AnimationStates<PlayerAnimationKey>;
    player2: AnimationStates<PlayerAnimationKey>;
    player3: AnimationStates<PlayerAnimationKey>;
    projectile: AnimationStates<ProjectileAnimationKey>;
    rock: AnimationStates<ObstacleAnimationKey>;
    powerup: AnimationStates<PowerupAnimationKey>;
    effects: AnimationStates<EffectAnimationKey>;
};
export class App extends Releasable {
    private gameContext: GameContext;
    private uniqueId = 10; /// offseting this number so values below are reserved for players
    private aiBrains: AiBrain[];
    private endgame = false;
    private timeTillRestart = 0;
    private winnerName = "";
    private powerupSpawnTimer: Timer;

    constructor(
        private eventEmitter: GameEventEmitter,
        private animationDB: Record<string, Record<string, AnimationFrame[]>>,
        private settings: GameSettings,
        private controllers: Controller[],
    ) {
        super();
        this.aiBrains = [];

        const createAnimationEngine = <T extends keyof AnimationDB>(
            animationSetName: T,
            speed = this.settings.COMMON_ANIMATION_FPS,
        ): AnimationEngine<GetAnimationKey<keyof AnimationDB[T]>> => {
            return AnimationEngine.fromStates(
                this.animationDB[animationSetName],
                speed,
            );
        };

        const eventQueue = new EventQueue();
        this.gameContext = {
            settings: this.settings,

            players: new FastArray<Player>(
                this.settings.PLAYER_COUNT,
                (i) =>
                    new Player(
                        i,
                        this.controllers[i],
                        createAnimationEngine(
                            ("player" + i) as keyof AnimationDB,
                        ),
                        eventQueue,
                    ),
            ),
            projectiles: new FastArray<Projectile>(
                64,
                () =>
                    new Projectile(
                        this.uniqueId++,
                        createAnimationEngine("projectile"),
                    ),
            ),
            obstacles: new FastArray<Obstacle>(
                this.settings.ROCK_COUNT + this.settings.PLAYER_COUNT,
                () =>
                    new Obstacle(this.uniqueId++, createAnimationEngine("rock")),
            ),
            powerups: new FastArray<Powerup>(
                4,
                () =>
                    new Powerup(
                        this.uniqueId++,
                        createAnimationEngine("powerup"),
                    ),
            ),
            effects: new FastArray<Effect>(
                16,
                () =>
                    new Effect(
                        this.uniqueId++,
                        createAnimationEngine(
                            "effects",
                            this.settings.EFFECT_ANIMATION_FPS,
                        ),
                    ),
            ),
            duration: 0,
            eventQueue: eventQueue,
            eventEmitter: this.eventEmitter,
            scores: [0, 0, 0, 0],
            wins: [0, 0, 0, 0],

            log: (msg: string): void => {
                console.log("Debug: " + msg);
            },
        };

        for (let i = 0; i < this.settings.PLAYER_COUNT; i++) {
            if (this.settings.PLAYER_SETTINGS[i].isComputerControlled) {
                this.aiBrains.push(
                    new AiBrain(
                        this.controllers[i] as SimpleController,
                        this.gameContext.players.getItem(i),
                        this.gameContext,
                    ),
                );
            }
        }

        this.powerupSpawnTimer = new Timer(() => {
            return PRNG.randomRangedFloat(
                settings.POWERUP_MIN_SPAWN_DELAY,
                settings.POWERUP_MAX_SPAWN_DELAY,
            );
        });

        const seed =
            this.settings.PRNG_SEED == 0 ? Date.now() : this.settings.PRNG_SEED;
        PRNG.setSeed(seed);

        this.reset();
        this.eventEmitter.emit("GameStarted");
    }

    updateLogic(dt: number): void {
        this.gameContext.duration += dt;

        if (this.gameContext.players.getSize() <= 1 && !this.endgame) {
            this.triggerEndgame();
        } else if (this.endgame) {
            this.timeTillRestart -= dt;

            if (this.timeTillRestart <= 0) {
                this.reset();
            }
        }

        this.powerupSpawnTimer.update(dt);

        this.aiBrains.forEach((b) => b.update(dt));

        this.gameContext.players.forEach((p) => p.update(dt, this.gameContext));
        this.gameContext.projectiles.forEach((p) =>
            p.update(dt, this.gameContext),
        );
        this.gameContext.obstacles.forEach((p) =>
            p.update(dt, this.gameContext),
        );
        this.gameContext.powerups.forEach((p) => {
            p.update(dt, this.gameContext);
        });
        this.gameContext.effects.forEach((e) => {
            e.update(dt, this.gameContext);
        });

        if (this.powerupSpawnTimer.ended()) {
            this.gameContext.eventQueue.add(eventSpawnPowerup());
            this.powerupSpawnTimer.reset();
        }

        CollisionMediator.processCollisions(this.gameContext);

        this.gameContext.eventQueue.process(this.gameContext);
    }

    getContext(): GameContext {
        return this.gameContext;
    }

    getEndgameStatus(): {
        endgameTriggered: boolean;
        timeTillRestart: number;
        winnerName: string;
        wins: number[];
        scores: number[];
        } {
        return {
            endgameTriggered: this.endgame,
            timeTillRestart: this.timeTillRestart,
            winnerName: this.winnerName,
            wins: this.gameContext.wins.slice(0, this.settings.PLAYER_COUNT),
            scores: this.gameContext.scores.slice(0, this.settings.PLAYER_COUNT),
        };
    }

    private triggerEndgame() {
        this.endgame = true;
        this.timeTillRestart = this.settings.TIME_TILL_RESTART;
        this.winnerName =
            this.gameContext.players.getSize() === 1
                ? this.settings.PLAYER_SETTINGS[
                    this.gameContext.players.getItem(0).id
                ].name
                : "nobody";

        if (this.gameContext.players.getSize() === 1) {
            this.gameContext.wins[this.gameContext.players.getItem(0).id]++;
            console.log(`Wins: ${this.gameContext.wins}`);
            console.log(`Points: ${this.gameContext.scores}`);
        }
    }

    private reset() {
        this.endgame = false;
        this.timeTillRestart = 0;

        this.gameContext.players.clear();
        this.gameContext.projectiles.clear();
        this.gameContext.obstacles.clear();
        this.gameContext.powerups.clear();
        this.gameContext.effects.clear();
        this.gameContext.duration = 0;

        if (this.gameContext.eventQueue.events.length !== 0) {
            alert("Programmatic error: Event queue not empty");
        }

        this.aiBrains.forEach((brain) => {
            brain.reset();
        });

        this.spawnPlayersAndRocks();
        this.powerupSpawnTimer.reset();
    }

    private spawnPlayersAndRocks() {
        const SPAWN_GRID_WIDTH = 5;
        const SPAWN_GRID_HEIGHT = 4;
        const NO_SPAWN = 0;
        const PLAYER_SPAWN = 1;
        const ROCK_SPAWN = 2;
        const NO_SPAWN_COUNT =
            SPAWN_GRID_WIDTH * SPAWN_GRID_HEIGHT -
            this.settings.PLAYER_COUNT -
            this.settings.ROCK_COUNT;

        const distribution = [
            ...new Array(this.settings.PLAYER_COUNT).fill(PLAYER_SPAWN),
            ...new Array(this.settings.ROCK_COUNT).fill(ROCK_SPAWN),
            ...new Array(NO_SPAWN_COUNT).fill(NO_SPAWN),
        ];

        const randomShuffleArray = (arr: number[]) => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = PRNG.randomInt() % (i + 1);
                const tmp = arr[i];
                arr[i] = arr[j];
                arr[j] = tmp;
            }
        };

        const getSpawnPosition = (xIndex: number, yIndex: number): Vector => {
            const chunkW =
                this.gameContext.settings.SCREEN_WIDTH / SPAWN_GRID_WIDTH;
            const chunkH =
                this.gameContext.settings.SCREEN_HEIGHT / SPAWN_GRID_HEIGHT;
            return new Vector(
                chunkW / 2 + chunkW * xIndex,
                chunkH / 2 + chunkH * yIndex,
            );
        };

        randomShuffleArray(distribution);

        let i = 0;
        for (let y = 0; y < SPAWN_GRID_HEIGHT; y++) {
            for (let x = 0; x < SPAWN_GRID_WIDTH; x++, i++) {
                switch (distribution[i]) {
                case NO_SPAWN:
                    break;
                case PLAYER_SPAWN:
                    this.gameContext.players.grow();
                    this.gameContext.players.getLastItem().spawn({
                        position: getSpawnPosition(x, y),
                        initialHealth: this.settings.PLAYER_INITIAL_HEALTH,
                        initialEnergy: this.settings.PLAYER_INITIAL_ENERGY,
                        maxEnergy: this.settings.PLAYER_MAX_ENERGY,
                    });
                    break;
                case ROCK_SPAWN:
                    this.gameContext.obstacles.grow();
                    this.gameContext.obstacles.getLastItem().spawn({
                        position: getSpawnPosition(x, y),
                        forward: Vector.zero(),
                        playerIndex: -1,
                    });
                    break;
                }
            }
        }
    }

    override release(): void {
        this.eventEmitter.emit("GameStopped");
    }
}
