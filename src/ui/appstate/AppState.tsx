import { JSX, Setter } from "solid-js";
import { AppController } from "./AppController";

export abstract class AppState {
    constructor(protected app: AppController) {}

    abstract renderTo(setComponent: Setter<JSX.Element>): void;

    abstract navigateTo(path: string): void;

    cleanup(): void {
        /* default impl */
        console.log("default");
    }
}
