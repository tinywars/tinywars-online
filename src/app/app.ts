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

export class App {
    private gameContext: GameContext;
    private uniqueId = 10; /// offseting this number so values below are reserved for players
    private controllers: Controller[];
    private aiBrains: AiBrain[];

    constructor(
        private keyboardState: Record<string, boolean>,
        private animationDB: Record<string, Record<string, AnimationFrame[]>>,
        private options: {
            INTERNAL_SCREEN_WIDTH: number;
            INTERNAL_SCREEN_HEIGHT: number;
            PLAYER_COUNT: number;
            AI_PLAYER_COUNT: number;
            ANIMATION_FPS: number;
        },
    ) {
        this.controllers = [];
        this.aiBrains = [];
        this.reset();
    }

    start(fps: number) {
        const frameTime = 1 / fps;

        setInterval(() => {
            this.updateLogic(frameTime);
        }, Math.floor(frameTime * 1000));
    }

    updateLogic(dt: number): void {

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

    private reset() {
        const INITIAL_ROCK_COUNT = 4;
        const PLAYER_INITIAL_HEALTH = 3;
        const PLAYER_INITIAL_ENERGY = 2;
        const PLAYER_MAX_ENERGY = 4;
        const LIVE_PLAYER_COUNT =
            this.options.PLAYER_COUNT - this.options.AI_PLAYER_COUNT;

        this.controllers = [];
        this.aiBrains = [];

        for (let i = 0; i < LIVE_PLAYER_COUNT; i++)
            this.controllers.push(
                this.createPhysicalController(i, this.keyboardState),
            );

        for (let i = LIVE_PLAYER_COUNT; i < this.options.PLAYER_COUNT; i++) {
            const aiController = new AiPoweredController();
            this.controllers.push(aiController);
            this.aiBrains.push(new AiBrain(aiController, i));
        }

        const createAnimationEngine = (
            animationSetName: string,
        ): AnimationEngine => {
            return new AnimationEngine(
                this.animationDB[animationSetName],
                this.options.ANIMATION_FPS,
            );
        };

        const eventQueue = new EventQueue();
        this.gameContext = {
            SCREEN_WIDTH: this.options.INTERNAL_SCREEN_WIDTH,
            SCREEN_HEIGHT: this.options.INTERNAL_SCREEN_HEIGHT,

            PLAYER_FORWARD_SPEED: 500,
            PLAYER_ROTATION_SPEED: 250,
            PLAYER_ENERGY_RECHARGE_SPEED: 0.5,
            PLAYER_MASS: 10,
            PROJECTILE_SPEED: 1000,
            PROJECTILE_DAMAGE: 1,
            PROJECTILE_ENABLE_TELEPORT: false,
            PROJECTILE_MASS: 1.5,

            OBSTACLE_MAX_SPEED: 750,
            OBSTACLE_HIT_DAMAGE: 10,
            OBSTACLE_MASS: 15,

            players: new FastArray<Player>(
                this.options.PLAYER_COUNT,
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
                16,
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

        const getRandomPosition = () =>
            new Vector(
                Math.floor(Math.random() * this.gameContext.SCREEN_WIDTH),
                Math.floor(Math.random() * this.gameContext.SCREEN_HEIGHT),
            );

        for (let i = 0; i < this.options.PLAYER_COUNT; i++)
            this.gameContext.players.grow();

        this.gameContext.players.forEach((p) => {
            p.spawn({
                position: getRandomPosition(),
                initialHealth: PLAYER_INITIAL_HEALTH,
                initialEnergy: PLAYER_INITIAL_ENERGY,
                maxEnergy: PLAYER_MAX_ENERGY,
            });
        });

        for (let i = 0; i < INITIAL_ROCK_COUNT; i++)
            this.gameContext.obstacles.grow();

        this.gameContext.obstacles.forEach((p) => {
            p.spawn({
                position: getRandomPosition(),
                forward: Vector.zero(),
                playerIndex: -1,
            });
        });
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
}
