import { App } from "./app";
import { AppState } from "./app-state";
import { Vector } from "../utility/vector";
import { Controller } from "../utility/controller";
import { KeyboardController } from "../utility/keyboard-controller";
import { FastArray } from "../utility/fast-array";
import { EventQueue } from "../events/event-queue";
import { GameContext } from "../game/game-context";
import { KeyCode } from "../game/key-codes";
import { Player } from "../game/player";
import { Projectile } from "../game/projectile";
import { AiBrain } from "../ai/ai-brain";
import { AiPoweredController } from "../ai/ai-controller";
import { AnimationEngine, AnimationFrame } from "../utility/animation";

export class AppStateGame implements AppState {
    private gameContext: GameContext;
    private uniqueId = 10; /// offseting this number so values below are reserved for players
    private controllers: Controller[] = [];
    private aiBrains: AiBrain[] = [];

    constructor(private app: App, keyboardState: Record<string, boolean>, animations: Record<string, Record<string, AnimationFrame[]>>) {
        console.log("AppStateGame construction");

        const ACTIVE_PLAYERS = 4;
        const ANIMATION_FPS = 2;

        this.controllers.push(this.createPhysicalController(0, keyboardState));
        //this.controllers.push(this.createPhysicalController(1, keyboardState));

        for (let i = 1; i < ACTIVE_PLAYERS; i++) {
            const aiController = new AiPoweredController()
            this.controllers.push(aiController);
            this.aiBrains.push(new AiBrain(aiController, i));
        }

        this.gameContext = {
            SCREEN_WIDTH: 1280,
            SCREEN_HEIGHT: 1280 / 4 * 3,
            
            PLAYER_FORWARD_SPEED: 128,
            PLAYER_ROTATION_SPEED: 96,
            PLAYER_ENERGY_RECHARGE_SPEED: 0.5,
            
            PROJECTILE_SPEED: 256,
            PROJECTILE_DAMAGE: 1,
            PROJECTILE_ENABLE_TELEPORT: false,

            players: new FastArray<Player>(4, (i) => new Player(
                i, 
                this.controllers[i], 
                new AnimationEngine(
                    animations["player" + i], 
                    ANIMATION_FPS))),
            projectiles: new FastArray<Projectile>(64, () => new Projectile(
                this.uniqueId++, 
                new AnimationEngine(
                    animations["projectile"], 
                    ANIMATION_FPS))),
            eventQueue: new EventQueue(),
            
            log: (msg: string): void => {
                console.log("Debug: " + msg);
            },
            generateId: (): number => {
                return this.uniqueId++;
            },
        };

        const PLAYER_INITIAL_HEALTH = 3;
        const PLAYER_INITIAL_ENERGY = 2;
        const PLAYER_MAX_ENERGY = 4;

        for (let i = 0; i < ACTIVE_PLAYERS; i++)
            this.gameContext.players.grow();

        this.gameContext.players.forEach((p) => {
            p.spawn({
                position: new Vector(
                    Math.floor(Math.random() * this.gameContext.SCREEN_WIDTH),
                    Math.floor(Math.random() * this.gameContext.SCREEN_HEIGHT),
                ),
                initialHealth: PLAYER_INITIAL_HEALTH, 
                initialEnergy: PLAYER_INITIAL_ENERGY, 
                maxEnergy: PLAYER_MAX_ENERGY});
        });
    }

    updateLogic(dt: number): void {
        this.aiBrains.forEach((b) => b.update(dt, this.gameContext));

        this.gameContext.players.forEach((p) => p.update(dt, this.gameContext));
        this.gameContext.projectiles.forEach((p) => p.update(dt, this.gameContext));

        this.gameContext.eventQueue.process(this.gameContext);
    }

    getContext(): GameContext {
        return this.gameContext;
    }

    private createPhysicalController(index: number, keyboardState: Record<string, boolean>): KeyboardController {
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
