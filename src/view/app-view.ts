import * as PIXI from "pixi.js";
import { App } from "../app-states/app";
import { GameObject } from "../game/game-object";
import { ViewObject } from "./view-object";
import { ViewObstacle } from "./view-obstacle";
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

        context.players.forEach((p, i) => this.addObject("player", p, i));
        for (let i = 0; i < context.projectiles.getCapacity(); i++) {
            const item = context.projectiles.getItem(i);
            this.addObject("projectile", item, 0);
        }

        for (let i = 0; i < context.obstacles.getCapacity(); i++) {
            const item = context.obstacles.getItem(i);
            this.addObject("rock", item, i % 2);
        }

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

    addObject(kind: string, gameObject: GameObject, index: number) {
        if (this.objectMap.has(gameObject.getHash())) return;

        console.log(
            gameObject.getHash() + " " + kind + "cond: " + (kind === "player"),
        );
        const viewObject = ((kind: string): ViewObject => {
            if (kind === "player") {
                return new ViewPlayer(this.viewApp, index);
            } else if (kind === "rock") {
                return new ViewObstacle(this.viewApp, index);
            }

            // Instead of else if branch so I don't have to reurn undefined
            return new ViewProjectile(this.viewApp);
        })(kind);
        viewObject?.updateCoords(gameObject.getCoords());
        this.objectMap.set(gameObject.getHash(), viewObject);
    }

    draw() {
        const state = this.app.topState();

        for (let i = 0; i < state.getContext().players.getCapacity(); i++) {
            const item = state.getContext().players.getItem(i);
            this.objectMap.get(item.getHash())?.updateCoords(item.getCoords());
        }

        for (let i = 0; i < state.getContext().projectiles.getCapacity(); i++) {
            const item = state.getContext().projectiles.getItem(i);
            this.objectMap.get(item.getHash())?.updateCoords(item.getCoords());
        }

        for (let i = 0; i < state.getContext().obstacles.getCapacity(); i++) {
            const item = state.getContext().obstacles.getItem(i);
            this.objectMap.get(item.getHash())?.updateCoords(item.getCoords());
        }
    }
}
