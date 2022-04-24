import * as PIXI from "pixi.js";
import { Player } from "../game/player";
import { ViewObject } from "./view-object";

export class ViewPlayer extends ViewObject {
    constructor(viewApp: PIXI.Application) {
        const texture = PIXI.Texture.from("./src/assets/gameTexture.png", {
            anisotropicLevel: 0,
        });
        texture.on("update", () => {
            texture.frame = new PIXI.Rectangle(0, 0, 32, 32);
            texture.updateUvs();
        });
        super(viewApp, texture);
    }
}
