import { AiBrain, State } from "./ai-brain";
import { GameContext } from "../game/game-context";

export type FsmTransition = (
    self: AiBrain,
    context: GameContext,
) => State | null;
// FsmState is an array of logic chunks that either return new state to transition into
// or returns void so the next logic chunk is executed instead
export type FsmState = FsmTransition[];

export class Fsm {
    private currentState: State;

    constructor(
        private states: Partial<Record<State, FsmState>>,
        initialState: State,
    ) {
        this.currentState = initialState;
    }

    update(self: AiBrain, context: GameContext) {
        const state = this.states[this.currentState];
        if (state === undefined) return;

        for (const transition of state) {
            const newState = transition(self, context);
            if (newState !== null) {
                this.currentState = newState;
                return;
            }
        }
    }

    setState(state: State) {
        this.currentState = state;
    }
}
