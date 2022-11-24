import { Accessor, Setter } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { AppRunner } from "../../../app/app-runner";
import { PlayerSettings } from "../../../game/player-settings";
import {
    CreateGameEventEmitter,
    CreateJukebox,
    CreateSoundPlayer,
    init
} from "../../../main";
import { TinywarsSocket } from "../../../networking/types";
import { AppController } from "../../appstate/AppController";
import { AppState } from "../../appstate/AppState";

export class GameState extends AppState {
    private appRunner: AppRunner | undefined;
    private init: () => AppRunner;
    FPS = 60;

    constructor(
        app: AppController,
        playerCount: number,
        settings: Accessor<PlayerSettings[]>,
        gameSeed: number,
        socket?: TinywarsSocket,
        myIndex?: number,
    ) {
        super(app);

        const soundPlayer = CreateSoundPlayer();
        const jukebox = CreateJukebox();
        const gameEventEmitter = CreateGameEventEmitter(soundPlayer, jukebox);
        const keyboardState: Record<string, boolean> = {};

        document.onkeydown = (e) => {
            keyboardState[e.code] = true;
        };
        document.onkeyup = (e) => {
            keyboardState[e.code] = false;
        };

        this.init = () =>
            init(
                gameEventEmitter,
                keyboardState,
                playerCount,
                settings(),
                gameSeed,
                socket,
                myIndex,
            );
    }

    renderTo(setComponent: Setter<JSX.Element>): void {
        setComponent(() =>
            GameStateView({
                navigateTo: (p: string) => {
                    this.navigateTo(p);
                },
            }),
        );

        this.appRunner = this.init();
        this.appRunner?.run(this.FPS);
    }

    navigateTo(path: string): void {
        if (path === "back") this.app.popState();
    }

    override cleanup() {
        console.log("GameState:cleanup");

        if (this.appRunner !== undefined) {
            this.appRunner.release();
            this.appRunner = undefined;
        }

        window.onresize = null;
    }
}

function GameStateView(props: { navigateTo: (p: string) => void }) {
    return (
        <div id="GameView">
            <canvas id="RenderCanvas"></canvas>

            <div id="GameSidebar">
                <button
                    onclick={() => props.navigateTo("back")}
                    class="menu_button"
                >
                    Exit game
                </button>
            </div>
        </div>
    );
}
