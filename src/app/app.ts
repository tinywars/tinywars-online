import { AiBrain } from "../ai/ai-brain";
import { AiPoweredController } from "../ai/ai-controller";
import { GameEventEmitter } from "../events/event-emitter";
import { EventQueue } from "../events/event-queue";
import { eventSpawnPowerup } from "../events/game-event";
import { CollisionMediator } from "../game/collision-mediator";
import { Effect, EffectType } from "../game/effect";
import { GameContext } from "../game/game-context";
import { GameSettings } from "../game/game-settings";
import { KeyCode } from "../game/key-codes";
import { Obstacle } from "../game/obstacle";
import { Player } from "../game/player";
import { Powerup } from "../game/powerup";
import { Projectile } from "../game/projectile";
import { AnimationEngine, AnimationFrame } from "../utility/animation";
import { Controller } from "../utility/controller";
import { FastArray } from "../utility/fast-array";
import { PhysicalController } from "../utility/physical-controller";
import { PRNG } from "../utility/prng";
import { Timer } from "../utility/timer";
import { Vector } from "../utility/vector";

export class App {
    private gameContext: GameContext;
    private uniqueId = 10; /// offseting this number so values below are reserved for players
    private controllers: Controller[];
    private aiBrains: AiBrain[];
    private endgame = false;
    private timeTillRestart = 0;
    private winnerName = "";
    private powerupSpawnTimer: Timer;

    constructor(
        private eventEmitter: GameEventEmitter,
        private keyboardState: Record<string, boolean>,
        private animationDB: Record<string, Record<string, AnimationFrame[]>>,
        private settings: GameSettings,
        effectTypeToAnimationName: (t: EffectType) => string,
    ) {
        const HUMAN_PLAYER_COUNT =
            this.settings.PLAYER_COUNT - this.settings.NPC_COUNT;

        this.controllers = [];
        this.aiBrains = [];

        for (let i = 0; i < HUMAN_PLAYER_COUNT; i++)
            this.controllers.push(
                this.createPhysicalController(i, this.keyboardState),
            );

        for (let i = HUMAN_PLAYER_COUNT; i < this.settings.PLAYER_COUNT; i++) {
            const aiController = new AiPoweredController();
            this.controllers.push(aiController);
        }

        const createAnimationEngine = (
            animationSetName: string,
            speed = this.settings.COMMON_ANIMATION_FPS,
        ) => {
            return new AnimationEngine(
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
                        createAnimationEngine("player" + i),
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
                    new Obstacle(
                        this.uniqueId++,
                        createAnimationEngine("rock"),
                    ),
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
                        effectTypeToAnimationName,
                    ),
            ),
            eventQueue: eventQueue,
            eventEmitter: this.eventEmitter,
            scores: [0, 0, 0, 0],
            wins: [0, 0, 0, 0],

            log: (msg: string): void => {
                console.log("Debug: " + msg);
            },
        };

        for (let i = HUMAN_PLAYER_COUNT; i < this.settings.PLAYER_COUNT; i++) {
            this.aiBrains.push(
                new AiBrain(
                    this.controllers[i] as AiPoweredController,
                    this.gameContext.players.getItem(i),
                    this.gameContext,
                ),
            );
        }

        this.powerupSpawnTimer = new Timer(() => {
            return PRNG.randomRangedFloat(
                settings.POWERUP_MIN_SPAWN_DELAY,
                settings.POWERUP_MAX_SPAWN_DELAY,
            );
        });

        this.reset();
        this.eventEmitter.emit("GameStarted");
    }

    start() {
        setInterval(() => {
            this.updateLogic(this.settings.FIXED_FRAME_TIME);
        }, Math.floor(this.settings.FIXED_FRAME_TIME * 1000));
    }

    updateLogic(dt: number): void {
        if (this.gameContext.players.getSize() <= 1 && !this.endgame) {
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
    } {
        return {
            endgameTriggered: this.endgame,
            timeTillRestart: this.timeTillRestart,
            winnerName: this.winnerName,
        };
    }

    private reset() {
        const seed =
            this.settings.PRNG_SEED == 0 ? Date.now() : this.settings.PRNG_SEED;
        PRNG.setSeed(seed);
        console.log(`SEED: ${seed}`);

        this.endgame = false;
        this.timeTillRestart = 0;

        this.gameContext.players.clear();
        this.gameContext.projectiles.clear();
        this.gameContext.obstacles.clear();
        this.gameContext.powerups.clear();
        this.gameContext.effects.clear();

        if (this.gameContext.eventQueue.events.length !== 0) {
            alert("Programmatic error: Event queue not empty");
        }

        this.aiBrains.forEach((brain) => {
            brain.reset();
        });

        this.spawnPlayersAndRocks();
    }

    private createPhysicalController(
        index: number,
        keyboardState: Record<string, boolean>,
    ): PhysicalController {
        const controls = this.settings.PLAYER_SETTINGS[index].controls;
        const result = new PhysicalController(keyboardState);

        Object.values(controls).forEach((binding) => {
            if (
                binding.key === undefined ||
                binding.button === undefined ||
                binding.code === undefined
            )
                return;
            result.bindDigitalInput(binding.key, binding.button, binding.code);
        });

        result.bindAnalogInput(controls.steerAxis, KeyCode.Rotation);
        result.setGamepadIndex(index);
        result.setGamepadAxisDeadzone(0.25);
        result.setInvertSteeringOnReverse(
            this.settings.PLAYER_SETTINGS[index].invertSteeringOnReverse,
        );
        return result;
    }

    private spawnPlayersAndRocks() {
        const distribution = [
            1, 1, 1, 1, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
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
            const chunkW = this.gameContext.settings.SCREEN_WIDTH / 5;
            const chunkH = this.gameContext.settings.SCREEN_HEIGHT / 4;
            return new Vector(
                chunkW / 2 + chunkW * xIndex,
                chunkH / 2 + chunkH * yIndex,
            );
        };

        randomShuffleArray(distribution);

        let i = 0;
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 5; x++, i++) {
                if (distribution[i] === 0) continue;
                else if (distribution[i] === 1) {
                    this.gameContext.players.grow();
                    this.gameContext.players.getLastItem().spawn({
                        position: getSpawnPosition(x, y),
                        initialHealth: this.settings.PLAYER_INITIAL_HEALTH,
                        initialEnergy: this.settings.PLAYER_INITIAL_ENERGY,
                        maxEnergy: this.settings.PLAYER_MAX_ENERGY,
                    });
                } else if (distribution[i] === 2) {
                    this.gameContext.obstacles.grow();
                    this.gameContext.obstacles.getLastItem().spawn({
                        position: getSpawnPosition(x, y),
                        forward: Vector.zero(),
                        playerIndex: -1,
                    });
                }
            }
        }
    }
}
