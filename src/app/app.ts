import { AiBrain } from "../ai/ai-brain";
import { GameContext } from "../game/game-context";
import { Controller } from "../utility/controller";
import {
    PhysicalController,
    GamepadButton,
    GamepadAxis,
} from "../utility/physical-controller";
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
    ): PhysicalController {
        const bindings = [
            [
                {
                    key: "KeyW",
                    button: GamepadButton.RTrigger,
                    code: KeyCode.Up,
                },
                {
                    key: "KeyA",
                    button: GamepadButton.DpadLeft,
                    code: KeyCode.Left,
                },
                {
                    key: "KeyS",
                    button: GamepadButton.LTrigger,
                    code: KeyCode.Down,
                },
                {
                    key: "KeyD",
                    button: GamepadButton.DpadRight,
                    code: KeyCode.Right,
                },
                {
                    key: "KeyE",
                    button: GamepadButton.X,
                    code: KeyCode.Shoot,
                },
                {
                    key: "KeyR",
                    button: GamepadButton.A,
                    code: KeyCode.Boost,
                },
            ],
            [
                {
                    key: "KeyI",
                    button: GamepadButton.RTrigger,
                    code: KeyCode.Up,
                },
                {
                    key: "KeyJ",
                    button: GamepadButton.DpadLeft,
                    code: KeyCode.Left,
                },
                {
                    key: "KeyK",
                    button: GamepadButton.LTrigger,
                    code: KeyCode.Down,
                },
                {
                    key: "KeyL",
                    button: GamepadButton.DpadRight,
                    code: KeyCode.Right,
                },
                {
                    key: "KeyO",
                    button: GamepadButton.X,
                    code: KeyCode.Shoot,
                },
                {
                    key: "KeyP",
                    button: GamepadButton.A,
                    code: KeyCode.Boost,
                },
            ],
        ];

        const result = new PhysicalController(keyboardState);
        bindings[index].forEach((binding) => {
            result.bindDigitalInput(binding.key, binding.button, binding.code);
        });
        result.bindAnalogInput(GamepadAxis.LHorizontal, KeyCode.Rotation);
        result.setGamepadIndex(index);
        result.setGamepadAxisDeadzone(0.25);
        return result;
    }

    private spawnPlayersAndRocks() {
        const getRandomPosition = () =>
            new Vector(
                Math.floor(Math.random() * this.settings.SCREEN_WIDTH),
                Math.floor(Math.random() * this.settings.SCREEN_HEIGHT),
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
