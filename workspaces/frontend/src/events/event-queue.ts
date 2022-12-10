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

    /**
     * Process all events pushed to the queue in the past frame
     * and empty the queue
     * @param context Game scene context
     */
    process(context: GameContext): void {
        // Note: do not use forEach - we might want to have
        // events that spawn other events in the future
        for (let i = 0; i < this.events.length; i++)
            this.events[i].process(context);
        this.events = [] as GameEvent[];
    }
}
