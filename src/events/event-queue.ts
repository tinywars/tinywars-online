import { GameContext } from "../game/game-context";
import { GameEvent } from "./game-event";

export class EventQueue {
    events: GameEvent[] = [];

    /**
     * Add new event to a queue
     * @param event Event created from a factory method
     * 
     * Example usage:
     * queue.add(DebugEvent("Message"));
     */
    add(event: GameEvent): void {
        this.events.push(event);
    }

    process(context: GameContext): void {
        this.events.forEach(event => {
            event.process(context);
        })
        this.events = [];
    }
}