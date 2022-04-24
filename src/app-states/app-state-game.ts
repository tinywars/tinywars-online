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

        this.gameContext = {
            player: new Player(this.img, this.controller),
            eventQueue: new EventQueue(),
            log: (msg: string): void => { console.log("Debug: " + msg); }
        };

        this.gameContext.player.spawn(new Vector(100, 100));
    }

    updateLogic(dt: number): void {
        //console.log("updateLogic(" + dt + ")");

        this.gameContext.player.update(dt, this.gameContext);

        this.gameContext.eventQueue.process(this.gameContext);
    }

    draw(canvas2d: CanvasRenderingContext2D): void {
        //console.log("Drawing");

        if (!this.ready) return;

        this.gameContext.player.draw(canvas2d);        
    }
}