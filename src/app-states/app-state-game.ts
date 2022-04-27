import { App } from "./app";
import { AppState } from "./app-state";
import { GameContext } from "../game/game-context";
import { EventQueue } from "../events/event-queue";
import { Vector } from "../utility/vector";
import { Controller } from "../utility/controller";
import { Player } from "../game/player";
import { FastArray } from "../utility/fast-array";
import { Projectile } from "../game/projectile";

export class AppStateGame implements AppState {
    private gameContext: GameContext;
    private uniqueId = 0;

    constructor(private app: App, private controller: Controller) {
        console.log("AppStateGame construction");

        /*this.ready = false;
        this.img = new Image();
        this.img.onload = () => {
            console.log("Image loaded!");
            this.ready = true;
        };
        this.img.src = "./src/assets/gameTexture.png";*/

        const player1 = new Player(this.controller);
        const player2 = new Player(this.controller);

        this.gameContext = {
            SCREEN_WIDTH: 1440,
            SCREEN_HEIGHT: 1080,
            
            PLAYER_FORWARD_SPEED: 128,
            PLAYER_ROTATION_SPEED: 96,
            
            PROJECTILE_SPEED: 192,
            PROJECTILE_DAMAGE: 1,

            players: [player1, player2],
            projectiles: new FastArray<Projectile>(64, () => new Projectile(this.uniqueId++) ),
            eventQueue: new EventQueue(),
            
            log: (msg: string): void => {
                console.log("Debug: " + msg);
            },
            generateId: (): number => {
                return this.uniqueId++;
            },
        };

        player1.spawn(new Vector(100, 100));
        player2.spawn(new Vector(300, 300));
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
