import * as PIXI from "pixi.js";
import { App } from "../app-states/app";
import { GameObject } from "../game/game-object";
import { ViewObject } from "./view-object";
import { ViewPlayer } from "./view-player";
import { ViewProjectile } from "./view-projectile";

export class AppView {
    private viewApp: PIXI.Application;
    private objectMap = new Map<string, ViewObject>();

    constructor(private app: App, private domElement: Element = document.body) {
        this.app = app;
        const context = this.app.topState().getContext();
        this.viewApp = new PIXI.Application({
            height: context.SCREEN_HEIGHT,
            width: context.SCREEN_WIDTH,
        });
        domElement.appendChild(this.viewApp.view);

        context.players.forEach((p) => this.addObject("player", p));
        this.viewApp.ticker.add(this.draw.bind(this));
    }

    /**
     * If window is smaller than max size, scale the whole scene down
     */
    scale() {
        const context = this.app.topState().getContext();
        let scale = 1;
        const height = context.SCREEN_HEIGHT;
        const width = context.SCREEN_WIDTH;
        if (
            this.domElement.clientHeight < height ||
            this.domElement.clientWidth < width
        ) {
            scale = Math.min(
                this.domElement.clientHeight / height,
                this.domElement.clientWidth / width,
            );
        }
        console.log(`scale is ${scale}`);

        this.viewApp.view.height = height * scale;
        this.viewApp.view.width = width * scale;
        this.viewApp.stage.scale.set(scale, scale);
    }

    addObject(kind: string, gameObject: GameObject) {
        if (this.objectMap.has(gameObject.getHash())) return;

        const viewObject = ((kind: string): ViewObject | undefined => {
            if (kind == "player")
                return new ViewPlayer(this.viewApp);
            else if (kind == "projectile")
                return new ViewProjectile(this.viewApp);
        })(kind);
        viewObject.updateCoords(gameObject.getCoords());
        this.objectMap.set(gameObject.getHash(), viewObject);
    }

    draw() {
        const state = this.app.topState();
        state.getContext().players.forEach((p) => {
            this.objectMap.get(p.getHash())?.updateCoords(p.getCoords());
        });
    }
}
