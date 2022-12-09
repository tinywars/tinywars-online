import { JSX, Setter } from "solid-js";
import { AppState } from "./AppState";
import { NullAppState } from "./NullAppState";

export class AppController {
    private stateStack: AppState[] = [];

    constructor(private setActiveComponent: Setter<JSX.Element>) {
        this.stateStack.push(new NullAppState(this));
    }

    topState(): AppState {
        return this.stateStack[this.stateStack.length - 1];
    }

    /**
     * Add new AppState to memory and trigger re-render of view
     */
    pushState(state: AppState) {
        this.stateStack.push(state);
        this.topState().renderTo(this.setActiveComponent);
    }

    /**
     * Remove top level AppState from memory and trigger re-render of view
     */
    popState() {
        this.topState().cleanup();
        this.stateStack.pop();
        this.topState().renderTo(this.setActiveComponent);
    }
}
