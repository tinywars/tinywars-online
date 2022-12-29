import { JSX, Setter } from "solid-js";
import { AppController } from "./AppController";

export abstract class AppState {
    constructor(protected app: AppController) {}

    abstract renderTo(setComponent: Setter<JSX.Element>): void;

    abstract navigateTo(path: string): void;

    // Called when stack is popped and app state is restored
    refocus(message?: string): void {
        /* default impl */
    }

    cleanup(): void {
        /* default impl */
    }
}
