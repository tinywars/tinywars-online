import { AppState } from "./app-state";
import * as constants from "../constants";

export class App {
    states: AppState[] = [];
    
    constructor(public context2d: CanvasRenderingContext2D) {}

    private topState(): AppState {
        return this.states[this.states.length - 1];
    }

    pushState(state: AppState) {
        this.states.push(state);
    }

    popState() {
        this.states.pop();
    }

    draw() {
        this.context2d.clearRect(0, 0, constants.GAME_SCREEN_WIDTH, constants.GAME_SCREEN_WIDTH);
        this.topState().draw(this.context2d);
        requestAnimationFrame(() => {
            this.draw();
        });
    }

    run(): void {
        console.log("Initializing game loop");

        setInterval(() => {
            this.topState().updateLogic(constants.FRAME_TIME);
        }, constants.FRAME_TIME);

        console.log("Preparing to draw");

        this.draw();
    }
}