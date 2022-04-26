import * as PIXI from "pixi.js";
import { ViewObject } from "./view-object";

export class ViewProjectile extends ViewObject {
    constructor(viewApp: PIXI.Application) {
        const texture = PIXI.Texture.from("./src/assets/gameTexture.png", {
            anisotropicLevel: 0,
        });
        /**
         * Textures are loaded asynchronously, so we need crop
         * the image in the update event
         */
        texture.on("update", () => {
            texture.frame = new PIXI.Rectangle(12, 32, 10, 4);
            texture.updateUvs();
        });
        super(viewApp, texture);
    }
}
