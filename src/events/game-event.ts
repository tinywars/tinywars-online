import { GameContext } from "../game/game-context";

export interface GameEvent {
    /**
     * Each event only need a process method which
     * gets whole game scene context passed in a parameter.
     * All custom parameters are embedded into the
     * callback by the factory method
     */
    process: (context: GameContext) => void;
}

/**
 * Example of game event. This one only performs logging
 * @param message Message to be logged
 * @returns Instance of GameEvent
 */
export function DebugEvent(message: string) {
    const e: GameEvent = {
        process: (context: GameContext): void => {
            context.log("DebugEvent: " + message);
        }
    };
    return e;
}