import * as PIXI from "pixi.js";
import { Coords } from "../utility/coords";

export abstract class ViewObject {
    protected sprite: PIXI.Sprite;

    constructor(viewApp: PIXI.Application, spriteSrc: PIXI.SpriteSource) {
        this.sprite = PIXI.Sprite.from(spriteSrc);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        viewApp.stage.addChild(this.sprite);
    }

    updateCoords(coords: Coords) {
        this.sprite.x = coords.x;
        this.sprite.y = coords.y;
        this.sprite.angle = coords.angle + 90;
    }

    getSprite() {
        return this.sprite;
    }
}
