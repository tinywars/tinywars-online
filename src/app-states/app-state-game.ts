import { App } from "./app";
import { AppState } from "./app-state";
import { Vector } from "../utility/vector";
import { Controller } from "../utility/controller";
import { FastArray } from "../utility/fast-array";
import { EventQueue } from "../events/event-queue";
import { GameContext } from "../game/game-context";
import { Player } from "../game/player";
import { Projectile } from "../game/projectile";

export class AppStateGame implements AppState {
    private gameContext: GameContext;
    private uniqueId = 0;

    constructor(private app: App, private controllers: Controller[]) {
        console.log("AppStateGame construction");

        this.gameContext = {
            SCREEN_WIDTH: 1280,
            SCREEN_HEIGHT: 1280 / 4 * 3,
            
            PLAYER_FORWARD_SPEED: 128,
            PLAYER_ROTATION_SPEED: 96,
            PLAYER_ENERGY_RECHARGE_SPEED: 0.5,
            
            PROJECTILE_SPEED: 256,
            PROJECTILE_DAMAGE: 1,
            PROJECTILE_ENABLE_TELEPORT: true,

            players: new FastArray<Player>(4, (i) => new Player(this.controllers[i])),
            projectiles: new FastArray<Projectile>(64, () => new Projectile(this.uniqueId++) ),
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

        const ACTIVE_PLAYERS = 2;
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

        this.gameContext.players.forEach((p) => p.update(dt, this.gameContext));
        this.gameContext.projectiles.forEach((p) => p.update(dt, this.gameContext));

        this.gameContext.eventQueue.process(this.gameContext);
    }

    getContext(): GameContext {
        return this.gameContext;
    }
}
