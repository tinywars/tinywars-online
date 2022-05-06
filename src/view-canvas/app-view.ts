import { Coords } from "../utility/coords";
import { App } from "../app/app";
import { Vector } from "../utility/vector";
import { AnimationFrame } from "../utility/animation";

export class Sprite {
    constructor(private texture: CanvasImageSource) {}

    draw(
        context: CanvasRenderingContext2D,
        options: {
            position: Vector;
            frame: AnimationFrame;
            rotation: number;
        },
    ) {
        const translation = new Vector(
            options.position.x, // + options.frame.w / 2,
            options.position.y, // + options.frame.h / 2
        );

        context.save();
        context.translate(translation.x, translation.y);
        context.rotate(((options.rotation + 90) * Math.PI) / 180.0);
        context.translate(-translation.x, -translation.y);
        context.drawImage(
            this.texture,
            options.frame.x,
            options.frame.y,
            options.frame.w,
            options.frame.h,
            options.position.x - options.frame.w / 2,
            options.position.y - options.frame.h / 2,
            options.frame.w,
            options.frame.h,
        );
        context.restore();
    }
}

export class AppViewCanvas {
    private context2d: CanvasRenderingContext2D;
    private texture: CanvasImageSource;
    private ready = false;
    private sprite: Sprite;

    constructor(private app: App, private canvas2d: HTMLCanvasElement) {
        this.context2d = this.canvas2d.getContext("2d")!;

        this.texture = new Image();
        this.texture.onload = () => {
            console.log("texture loaded!");
            this.draw();
        };
        this.texture.src = "./src/assets/gameTexture.png";

        this.sprite = new Sprite(this.texture);
    }

    scale() {
        let width = window.innerWidth;
        let height = window.innerHeight;

        // We want to compute maximum possible 4:3 canvas
        if (width / 4 < height / 3) {
            height = (width * 3) / 4;
        } else {
            width = (height * 4) / 3;
        }

        this.canvas2d.width = width;
        this.canvas2d.height = height;

        this.context2d.scale(
            width / this.app.getContext().settings.SCREEN_WIDTH,
            height / this.app.getContext().settings.SCREEN_HEIGHT,
        );
    }

    draw() {
        const context = this.app.getContext();

        this.context2d.fillRect(
            0,
            0,
            context.settings.SCREEN_WIDTH,
            context.settings.SCREEN_HEIGHT,
        );
        context.players.forEach((p) => {
            this.drawEntity(p.getCoords());
        });
        context.projectiles.forEach((p) => {
            this.drawEntity(p.getCoords());
        });
        context.obstacles.forEach((o) => {
            this.drawEntity(o.getCoords());
        });

        const endgameStatus = this.app.getEndgameStatus();
        if (endgameStatus.endgameTriggered) {
            this.writeText(
                endgameStatus.winnerName + " won",
                context.settings.SCREEN_WIDTH / 2,
                context.settings.SCREEN_HEIGHT / 2,
            );
            this.writeText(
                "Restart in: " + Math.round(endgameStatus.timeTillRestart),
                context.settings.SCREEN_WIDTH / 2,
                context.settings.SCREEN_HEIGHT / 2 + 80,
            );
        }

        requestAnimationFrame(() => {
            this.draw();
        });
    }

    private writeText(text: string, x: number, y: number) {
        this.context2d.font = "72px arial";
        this.context2d.textAlign = "center";
        this.context2d.textBaseline = "middle";
        this.context2d.fillStyle = "white";
        this.context2d.fillText(text, x, y);
        this.context2d.fillStyle = "black";
    }

    private drawEntity(coords: Coords) {
        this.sprite.draw(this.context2d, {
            position: coords.position,
            rotation: coords.angle,
            frame: coords.frame,
        });
    }
}
