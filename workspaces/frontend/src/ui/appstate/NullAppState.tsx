import { JSX, Setter } from "solid-js";
import { AppController } from "./AppController";
import { AppState } from "./AppState";
import { EmptyComponent } from "./EmptyComponent";

export class NullAppState extends AppState {
    constructor(app: AppController) {
        super(app);
    }

    override renderTo(componentSetter: Setter<JSX.Element>): void {
        componentSetter(EmptyComponent);
    }

    override navigateTo(): void {
        /* intentionally left blank */
    }
}
