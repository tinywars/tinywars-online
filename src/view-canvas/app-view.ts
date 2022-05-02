import { Coords } from "../utility/coords";
import { App } from "../app-states/app";
import { Vector } from "../utility/vector";
import { AnimationFrame } from "../utility/animation";
import { Player } from "../game/player";

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

    drawHud(
        context: CanvasRenderingContext2D,
        options: {
            position: Vector;
            frame: AnimationFrame;
        },
    ) {
        context.drawImage(
            this.texture,
            options.frame.x,
            options.frame.y,
            options.frame.w,
            options.frame.h,
            options.position.x,
            options.position.y,
            options.frame.w,
            options.frame.h,
        );
    }
}

export class AppViewCanvas {
    private context2d: CanvasRenderingContext2D;
    private texture: CanvasImageSource;
    private ready = false;
    private sprite: Sprite;

    constructor(
        private app: App,
        private canvas2d: HTMLCanvasElement,
        private hudFrames: Record<string, AnimationFrame>,
    ) {
        this.context2d = this.canvas2d.getContext("2d")!;

        this.texture = new Image();
        this.texture.onload = () => {
            console.log("texture loaded!");
            this.draw();
        };
        this.texture.src = "./src/assets/spritesheet_v2.png";

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
            this.drawHudForPlayer(p);
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

    private drawHudForPlayer(player: Player) {
        const coords = player.getCoords();
        const healthBarFrame = this.hudFrames["healthbar"]!;
        const energyBarFrame = this.hudFrames["energybar"]!;
        const energyFrameWidthBackup = energyBarFrame.w;

        for (let i = 0; i < player.getHealth(); i++) {
            this.sprite.drawHud(this.context2d, {
                position: new Vector(
                    coords.position.x - 16 + i * (healthBarFrame.w + 1),
                    coords.position.y + 16,
                ),
                frame: healthBarFrame,
            });
        }

        let energy = Math.floor(player.getEnergy() * 100);
        let itr = 0;
        while (energy >= 0) {
            // Last bar, that is refilling most of the time needs
            // to be scaled according to how much filled it is
            energyBarFrame.w =
                energyFrameWidthBackup * (energy > 100 ? 1 : energy / 100);
            this.sprite.drawHud(this.context2d, {
                position: new Vector(
                    coords.position.x - 16 + itr * (energyFrameWidthBackup + 2),
                    coords.position.y + 16 + healthBarFrame.h + 1,
                ),
                frame: energyBarFrame,
            });

            itr++;
            energy -= 100;
        }

        // Restore width of energyBarFrame because we've changed it a lot
        energyBarFrame.w = energyFrameWidthBackup;
    }
}
