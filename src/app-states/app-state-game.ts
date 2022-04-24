import { App } from "./app";
import { AppState } from "./app-state";
import { GameContext } from "../game/game-context";
import { EventQueue } from "../events/event-queue";
import { Vector } from "../utility/vector";
import { Controller } from "../utility/controller";
import { Player } from "../game/player";

export class AppStateGame implements AppState {
    private gameContext: GameContext;
    private img: CanvasImageSource;
    private ready: boolean;

    constructor(private app: App, private controller: Controller) {
        console.log("AppStateGame construction");

        this.ready = false;
        this.img = new Image();
        this.img.onload = () => {
            console.log("Image loaded!");
            this.ready = true;
        };
        this.img.src = "./src/assets/gameTexture.png";

        const player1 = new Player(this.img, this.controller);
        const player2 = new Player(this.img, this.controller);

        this.gameContext = {
            SCREEN_WIDTH: 1440,
            SCREEN_HEIGHT: 1080,
            players: [player1, player2],
            eventQueue: new EventQueue(),
            log: (msg: string): void => {
                console.log("Debug: " + msg);
            },
        };

        player1.spawn(new Vector(100, 100));
        player2.spawn(new Vector(300, 300));
    }

    updateLogic(dt: number): void {
        //console.log("updateLogic(" + dt + ")");

        this.gameContext.players.forEach((p) => p.update(dt, this.gameContext));

        this.gameContext.eventQueue.process(this.gameContext);
    }

    getContext(): GameContext {
        return this.gameContext;
    }
}
