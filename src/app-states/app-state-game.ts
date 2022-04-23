import { App } from "./app";
import { AppState } from "./app-state";
import { GameContext } from "../game/game-context";
import { EventQueue } from "../events/event-queue";
import { Vector } from "../utility/vector";
import { Controller } from "../utility/controller";
import { KeyCode } from "../game/key-codes";
import { Sprite } from "../utility/sprite";

export class AppStateGame implements AppState {
    private context: GameContext;
    private img: CanvasImageSource;
    private ready: boolean;
    private sprite: Sprite;
    private position: Vector;
    private rotation: number;
    private MAX_SPEED = 128;

    constructor(private app: App, private controller: Controller) {
        console.log("AppStateGame construction");

        this.context = {
            eventQueue: new EventQueue(),
            log: (msg: string): void => { console.log("Debug: " + msg); }
        };

        this.ready = false;
        this.img = new Image();
        this.img.onload = () => {
            console.log("Image loaded!");
            this.ready = true;
        };
        this.img.src = "./src/assets/gameTexture.png";
        this.sprite = new Sprite(this.img, 0, 0, 32, 32);

        this.position = new Vector(20, 0);
        this.rotation = 45;
    }

    updateLogic(dt: number): void {
        console.log("updateLogic(" + dt + ")");

        const forward = new Vector(0, 0);
        if (this.controller.isKeyPressed(KeyCode.Up)) {
            forward.y = -this.MAX_SPEED;
        }
        else if (this.controller.isKeyPressed(KeyCode.Down)) {
            forward.y = this.MAX_SPEED;
        }

        if (this.controller.isKeyPressed(KeyCode.Left)) {
            forward.x = -this.MAX_SPEED;
        }
        else if (this.controller.isKeyPressed(KeyCode.Right)) {
            forward.x = this.MAX_SPEED;
        }

        this.position = this.position.add(forward.scale(dt));

        this.context.eventQueue.process(this.context);
    }

    draw(canvas2d: CanvasRenderingContext2D): void {
        /* TODO */
        console.log("Drawing");

        if (!this.ready) return;

        this.sprite.draw(canvas2d, this.position.x, this.position.y, 32, 32, this.rotation);        
    }
}