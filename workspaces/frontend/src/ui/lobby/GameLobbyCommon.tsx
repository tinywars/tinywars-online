import { Accessor, createSignal, Setter } from "solid-js";
import { AppController } from "../appstate/AppController";
import { AppState } from "../appstate/AppState";
import { REFOCUS_MESSAGE_GAME_SCORES_SET } from "../game/Game";
import { FinalScore, GameEndedState, REFOCUS_MESSAGE_GAME_SCORES_EXITED } from "../game/GameEnded";

export abstract class GameLobbyCommon extends AppState {
    protected finalScores: Accessor<FinalScore[]>;
    protected setFinalScores: Setter<FinalScore[]>;
    protected pointLimit: Accessor<number>;
    protected setPointLimit: Setter<number>;

    constructor(app: AppController) {
        super(app);
        [this.finalScores, this.setFinalScores] = createSignal([]);
        [this.pointLimit, this.setPointLimit] = createSignal(5);
    }

    override refocus(message?: string) {
        if (!message) return;

        if (message === REFOCUS_MESSAGE_GAME_SCORES_SET) {
            this.app.pushState(new GameEndedState(this.app, this.finalScores()));
        }
        else if (message === REFOCUS_MESSAGE_GAME_SCORES_EXITED) {
            this.app.popState(); // bubble to upper menu
        }
    }
}
