import * as PIXI from "pixi.js";
import { Coords } from "../utility/coords";
import { AnimationFrame } from "../utility/animation";

export abstract class ViewObject {
    protected sprite: PIXI.Sprite;

    constructor(
        viewApp: PIXI.Application,
        private texture: PIXI.Texture<PIXI.Resource>,
    ) {
        this.sprite = PIXI.Sprite.from(texture);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        viewApp.stage.addChild(this.sprite);
    }

    updateCoords(coords: Coords) {
        this.sprite.x = coords.position.x;
        this.sprite.y = coords.position.y;
        this.sprite.angle = coords.angle + 90;

        //if (coords.frame !== undefined)
        //  this.setFrame(coords.frame);
    }

    getSprite() {
        return this.sprite;
    }

    setFrame(frame: AnimationFrame): void {
        this.texture.frame = new PIXI.Rectangle(
            frame.x,
            frame.y,
            frame.w,
            frame.h,
        );
        this.texture.updateUvs();
    }
}
