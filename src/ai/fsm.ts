import { State } from "./ai-brain";

export type FsmTransitionCondition = () => boolean;
export type FsmStateLogic = () => void;
export type FsmTransition = () => State | null;

// FsmState consist of:
// * array of pairs - FsmCondition and code of state to go to if condition is true
// * default behaviour
// * default state to go to (or null if state is supposed to loop)
// However we can simplify it as array of transitions, where
// each transitions does some logic and returns either new state code
// or null.
// This allows far greater expressiveness than we need and supports
// simpler evaluation code.
// fsm builder module is here to help the user set up the structures properly.
export type FsmState = FsmTransition[];

export class Fsm {
    private currentState: State;

    constructor(
        private states: Partial<Record<State, FsmState>>,
        initialState: State,
    ) {
        this.currentState = initialState;
    }

    update() {
        const state = this.states[this.currentState];
        if (state === undefined) return;

        for (const transition of state) {
            const newState = transition();
            if (newState !== null) {
                this.currentState = newState;
                return;
            }
        }
    }

    setState(state: State) {
        this.currentState = state;
    }

    getState(): State {
        return this.currentState;
    }
}
