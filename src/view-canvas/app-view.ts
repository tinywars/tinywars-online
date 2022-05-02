import { Coords } from "../utility/coords";
import { App } from "../app-states/app";
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
            width / this.app.topState().getContext().SCREEN_WIDTH,
            height / this.app.topState().getContext().SCREEN_HEIGHT,
        );
    }

    draw() {
        console.log("Drawing");

        this.context2d.fillRect(
            0,
            0,
            this.app.topState().getContext().SCREEN_WIDTH,
            this.app.topState().getContext().SCREEN_HEIGHT,
        );

        const context = this.app.topState().getContext();
        context.players.forEach((p) => {
            this.drawEntity(p.getCoords());
        });
        context.projectiles.forEach((p) => {
            this.drawEntity(p.getCoords());
        });
        context.obstacles.forEach((o) => {
            this.drawEntity(o.getCoords());
        });

        requestAnimationFrame(() => {
            this.draw();
        });
    }

    private drawEntity(coords: Coords) {
        this.sprite.draw(this.context2d, {
            position: coords.position,
            rotation: coords.angle,
            frame: coords.frame,
        });
    }
}
