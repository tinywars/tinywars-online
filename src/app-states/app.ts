import { AppState } from "./app-state";

export class App {
    states: AppState[] = [];
    
    constructor() { 
        console.log("App created")
    }

    topState(): AppState {
        return this.states[this.states.length - 1];
    }

    pushState(state: AppState) {
        this.states.push(state);
    }

    popState() {
        this.states.pop();
    }

    draw() { 
        console.log("drawing...")
    }

    run(fps: number): void {
        const frameTime = 1 / fps;

        console.log("Initializing game loop");

        setInterval(() => {
            this.topState().updateLogic(frameTime);
        }, frameTime);

        console.log("Preparing to draw");

        this.draw();
    }
}