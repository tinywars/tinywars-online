import { App } from './app';
import { AppState } from './app-state';
import { GameContext } from '../game/game-context';
import { EventQueue } from '../events/event-queue';

export class AppStateGame implements AppState {
    private context: GameContext;

    constructor(private app: App) {
        this.context = {
            eventQueue: new EventQueue(),
            log: (msg: string): void => { console.log("Debug: " + msg); }
        };
    }

    updateLogic(dt: number): void {
        this.context.eventQueue.process(this.context);
    }

    draw(): void {
        /* TODO */
    }
}