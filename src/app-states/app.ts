import { AppState } from './app-state';

export class App {
    states: AppState[] = [];

    private topState(): AppState {
        return this.states[this.states.length - 1];
    }

    pushState(state: AppState) {
        this.states.push(state);
    }

    popState() {
        this.states.pop();
    }

    run(fps: number): void {
        const frameTime = 1000 / fps;

        setInterval(() => {
            this.topState().updateLogic(frameTime);
        }, frameTime);

        while (this.states.length > 0) {
            this.topState().draw();
        }
    }
}