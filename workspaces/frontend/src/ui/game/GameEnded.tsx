import { For, Setter } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { AppController } from "../appstate/AppController";
import { AppState } from "../appstate/AppState";
import "./GameEnded.css";

export const REFOCUS_MESSAGE_GAME_SCORES_EXITED = "GameEnded:Exited";

export interface FinalScore {
    playerName: string;
    score: number;
}

export class GameEndedState extends AppState {
    constructor(app: AppController, private scores: FinalScore[]) {
        super(app);
        console.log(scores);
        scores.sort((a: FinalScore, b: FinalScore) => b.score - a.score);
    }

    renderTo(setComponent: Setter<JSX.Element>): void {
        setComponent(() => 
            GameEndedStateView({
                navigateTo: (p: string) => { this.navigateTo(p); },
                scores: this.scores,
            }),
        );
    }

    navigateTo(path: string): void {
        if (path === "back") {
            this.app.popState(REFOCUS_MESSAGE_GAME_SCORES_EXITED);
        }
    }

}

function GameEndedStateView(props: {
    navigateTo: (p: string) => void;
    scores: FinalScore[]
}) {
    return (
        <div class="container-100">
            <h1 class="title">{props.scores[0].playerName} won!</h1>
            <div class="container-20">
                <div id="ScoreListTbody" class="vbox">
                    <For each={props.scores}>
                        {(finalScore) => (
                            <div class="hbox space-between">
                                <div>{finalScore.playerName}</div>
                                <div>{finalScore.score}</div>
                            </div>
                        )}
                    </For>
                </div>
                
                <br></br>

                <div class="hbox">
                    <button onclick={() => props.navigateTo("back")}>
                        Back to menu
                    </button>
                </div>
            </div>
        </div>
    )
}
