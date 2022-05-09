import { AiBrain } from "../ai/ai-brain";
import { GameContext } from "../game/game-context";
import { Controller } from "../utility/controller";
import { KeyboardController } from "../utility/keyboard-controller";
import { KeyCode } from "../game/key-codes";
import { AnimationFrame } from "../utility/animation";
import { AiPoweredController } from "../ai/ai-controller";
import { EventQueue } from "../events/event-queue";
import { FastArray } from "../utility/fast-array";
import { AnimationEngine } from "../utility/animation";
import { Player } from "../game/player";
import { Obstacle } from "../game/obstacle";
import { Projectile } from "../game/projectile";
import { Vector } from "../utility/vector";
import { GameSettings } from "../game/game-settings";
import { PRNG } from "../utility/prng";

export class App {
    private gameContext: GameContext;
    private uniqueId = 10; /// offseting this number so values below are reserved for players
    private controllers: Controller[];
    private aiBrains: AiBrain[];
    private endgame = false;
    private timeTillRestart = 0;
    private winnerName = "";

    constructor(
        private keyboardState: Record<string, boolean>,
        private animationDB: Record<string, Record<string, AnimationFrame[]>>,
        private settings: GameSettings,
    ) {
        PRNG.setSeed(Date.now()); // TODO: this.settings.PRNG_SEED

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
            this.aiBrains.push(new AiBrain(aiController, i));
        }

        const createAnimationEngine = (
            animationSetName: string,
        ): AnimationEngine => {
            return new AnimationEngine(
                this.animationDB[animationSetName],
                this.settings.ANIMATION_FPS,
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
            eventQueue: eventQueue,

            log: (msg: string): void => {
                console.log("Debug: " + msg);
            },
        };

        this.reset();
    }

    start(fps: number) {
        const frameTime = 1 / fps;

        setInterval(() => {
            this.updateLogic(frameTime);
        }, Math.floor(frameTime * 1000));
    }

    updateLogic(dt: number): void {
        if (this.gameContext.players.getSize() <= 1 && !this.endgame) {
            this.endgame = true;
            this.timeTillRestart = this.settings.TIME_TILL_RESTART;
            this.winnerName =
                this.gameContext.players.getSize() === 1
                    ? this.settings.PLAYER_NAMES[
                          this.gameContext.players.getItem(0).id
                      ]
                    : "nobody";
        } else if (this.endgame) {
            this.timeTillRestart -= dt;

            if (this.timeTillRestart <= 0) {
                this.reset();
            }
        }

        this.aiBrains.forEach((b) => b.update(dt, this.gameContext));

        this.gameContext.players.forEach((p) => p.update(dt, this.gameContext));
        this.gameContext.projectiles.forEach((p) =>
            p.update(dt, this.gameContext),
        );
        this.gameContext.obstacles.forEach((p) =>
            p.update(dt, this.gameContext),
        );

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
        this.endgame = false;
        this.timeTillRestart = 0;

        this.gameContext.players.clear();
        this.gameContext.projectiles.clear();
        this.gameContext.obstacles.clear();

        if (this.gameContext.eventQueue.events.length !== 0) {
            alert("Programmatic error: Event queue not empty");
        }

        this.spawnPlayersAndRocks();
    }

    private createPhysicalController(
        index: number,
        keyboardState: Record<string, boolean>,
    ): KeyboardController {
        const bindings = [
            [
                { key: "KeyW", code: KeyCode.Up },
                { key: "KeyA", code: KeyCode.Left },
                { key: "KeyS", code: KeyCode.Down },
                { key: "KeyD", code: KeyCode.Right },
                { key: "KeyE", code: KeyCode.Shoot },
                { key: "KeyR", code: KeyCode.Boost },
            ],
            [
                { key: "KeyI", code: KeyCode.Up },
                { key: "KeyJ", code: KeyCode.Left },
                { key: "KeyK", code: KeyCode.Down },
                { key: "KeyL", code: KeyCode.Right },
                { key: "KeyO", code: KeyCode.Shoot },
                { key: "KeyP", code: KeyCode.Boost },
            ],
        ];

        const result = new KeyboardController(keyboardState);
        bindings[index].forEach((binding) => {
            result.bindKey(binding.key, binding.code);
        });
        return result;
    }

    private spawnPlayersAndRocks() {
        const getRandomPosition = () =>
            new Vector(
                PRNG.randomRangedInt(0, this.settings.SCREEN_WIDTH),
                PRNG.randomRangedInt(0, this.settings.SCREEN_HEIGHT),
            );

        for (let i = 0; i < this.settings.PLAYER_COUNT; i++)
            this.gameContext.players.grow();

        this.gameContext.players.forEach((p) => {
            p.spawn({
                position: getRandomPosition(),
                initialHealth: this.settings.PLAYER_INITIAL_HEALTH,
                initialEnergy: this.settings.PLAYER_INITIAL_ENERGY,
                maxEnergy: this.settings.PLAYER_MAX_ENERGY,
            });
        });

        for (let i = 0; i < this.settings.ROCK_COUNT; i++)
            this.gameContext.obstacles.grow();

        this.gameContext.obstacles.forEach((p) => {
            p.spawn({
                position: getRandomPosition(),
                forward: Vector.zero(),
                playerIndex: -1,
            });
        });
    }
}
