import { AiBrain, State } from "./ai-brain";
import { FsmState, FsmTransition } from "./fsm";
import { GameContext } from "../game/game-context";

type FsmCondition = (self: AiBrain, context: GameContext) => boolean;
type FsmStateLogic = (self: AiBrain, context: GameContext) => void;

export function DoNothing(): FsmState {
    return [];
}

export function If(condition: FsmCondition): FsmConditionBuilder {
    return new FsmConditionBuilder(condition, []);
}

export function Do(logic: FsmStateLogic): FsmHopStateBuilder {
    return new FsmHopStateBuilder(logic);
}

export function not(condition: FsmCondition): FsmCondition {
    return (self: AiBrain, context: GameContext) => {
        return !condition(self, context);
    };
}

class FsmHopStateBuilder {
    constructor(private logic: FsmStateLogic) {}

    thenGoTo(state: State): FsmState {
        return [
            (self: AiBrain, context: GameContext) => {
                this.logic(self, context);
                return state;
            },
        ];
    }
}

class FsmLoopingStateBuilder {
    constructor(private transitions: FsmTransition[]) {}

    orIf(condition: FsmCondition): FsmConditionBuilder {
        return new FsmConditionBuilder(condition, this.transitions);
    }

    otherwiseDo(logic: FsmStateLogic): FsmState {
        this.transitions.push((self: AiBrain, context: GameContext) => {
            logic(self, context);
            return null;
        });
        return this.transitions;
    }
}

class FsmConditionBuilder {
    constructor(
        public nextCondition: FsmCondition,
        private transitions: FsmTransition[],
    ) {}

    goTo(nextState: State): FsmLoopingStateBuilder {
        this.transitions.push((self: AiBrain, context: GameContext) => {
            return this.nextCondition(self, context) ? nextState : null;
        });
        return new FsmLoopingStateBuilder(this.transitions);
    }
}
