import * as PIXI from "pixi.js";
import { ViewObject } from "./view-object";

export class ViewPlayer extends ViewObject {
    constructor(viewApp: PIXI.Application, index: number) {
        const texture = PIXI.Texture.from("./src/assets/gameTexture.png", {
            anisotropicLevel: 0,
        }).clone();
        /**
         * Textures are loaded asynchronously, so we need crop
         * the image in the update event
         */
        texture.on("update", () => {
            texture.frame = new PIXI.Rectangle(32 * index, 0, 32, 32);
            texture.updateUvs();
        });
        super(viewApp, texture);
    }
}
