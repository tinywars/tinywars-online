import { AppState } from "./app-state";

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
        this.context2d.clearRect(0, 0, this.context2d.canvas.width, this.context2d.canvas.height);
        this.topState().draw(this.context2d);
        requestAnimationFrame(() => {this.draw()});
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