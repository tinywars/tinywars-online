import * as PIXI from "pixi.js";
import { ViewObject } from "./view-object";

export class ViewPlayer extends ViewObject {
    constructor(viewApp: PIXI.Application) {
        const texture = PIXI.Texture.from("./src/assets/gameTexture.png", {
            anisotropicLevel: 0,
        });
        /**
         * Textures are loaded asynchronously, so we need crop
         * the image in the update event
         */
        texture.on("update", () => {
            texture.frame = new PIXI.Rectangle(0, 0, 32, 32);
            texture.updateUvs();
        });
        super(viewApp, texture);
    }
}
