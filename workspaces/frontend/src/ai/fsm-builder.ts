import { assert } from "chai";
import { State } from "./ai-brain";
import {
    FsmState,
    FsmStateLogic,
    FsmTransition,
    FsmTransitionCondition
} from "./fsm";

export function DoNothing(): FsmState {
    return [];
}

export function If(condition: FsmTransitionCondition): FsmTransitionBuilder {
    return new FsmTransitionBuilder(condition, []);
}

export function Do(logic: FsmStateLogic): FsmDefaultLogicBuilder {
    return new FsmDefaultLogicBuilder([], logic);
}

class FsmTransitionBuilder {
    constructor(
        private currentCondition: FsmTransitionCondition,
        private transitions: FsmTransition[],
    ) {}

    goTo(state: State): FsmConditionBuilder {
        this.transitions.push(() => {
            return this.currentCondition() ? state : null;
        });
        return new FsmConditionBuilder(this.transitions);
    }
}

class FsmConditionBuilder {
    constructor(private transitions: FsmTransition[]) {}

    orIf(condition: FsmTransitionCondition): FsmTransitionBuilder {
        return new FsmTransitionBuilder(condition, this.transitions);
    }

    otherwiseDo(logic: FsmStateLogic): FsmDefaultLogicBuilder {
        return new FsmDefaultLogicBuilder(this.transitions, logic);
    }
}

class FsmDefaultLogicBuilder {
    constructor(
        private transitions: FsmTransition[],
        private defaultLogic: FsmStateLogic,
    ) {}

    thenGoTo(state: State): FsmState {
        this.transitions.push(() => {
            this.defaultLogic();
            return state;
        });
        return this.transitions;
    }

    andLoop(): FsmState {
        assert(
            this.transitions.length !== 0,
            "You are trying to make a FSM state is looping and has no transition conditions",
        );
        this.transitions.push(() => {
            this.defaultLogic();
            return null;
        });
        return this.transitions;
    }
}
