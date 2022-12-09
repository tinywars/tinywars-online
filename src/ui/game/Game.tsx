import { Accessor, onCleanup, onMount, Setter } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { AppRunner } from "../../app/app-runner";
import { PlayerSettings } from "../../game/player-settings";
import {
    CreateGameEventEmitter,
    CreateJukebox,
    CreateSoundPlayer,
    init
} from "../../main";
import { TinywarsSocket } from "../../networking/types";
import { AppController } from "../appstate/AppController";
import { AppState } from "../appstate/AppState";
import { logMount, logUnmount } from "../UiLogger";
import "./Game.css";

export class GameState extends AppState {
    private appRunner: AppRunner | undefined;
    private init: () => AppRunner;
    private soundPlayer = CreateSoundPlayer();
    private jukebox = CreateJukebox();
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

        const gameEventEmitter = CreateGameEventEmitter(
            this.soundPlayer,
            this.jukebox,
        );
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
                setMusicVolume: (value: number) => {
                    this.jukebox.setVolume(value / 100.0);
                },
                setSoundVolume: (value: number) => {
                    this.soundPlayer.setVolume(value / 100.0);
                },
            }),
        );

        // Must initialize apprunner after component is rendered
        // because it fetches reference to canvas element
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

function GameStateView(props: {
    navigateTo: (p: string) => void;
    setMusicVolume: (value: number) => void;
    setSoundVolume: (value: number) => void;
}) {
    onMount(() => {
        logMount("GameStateView");
    });

    onCleanup(() => {
        logUnmount("GameStateView");
    });

    return (
        <table id="GameView">
            <tbody>
                <tr>
                    <td id="RenderCanvasParent">
                        <canvas id="RenderCanvas"></canvas>
                    </td>
                    <td id="GameSidebar">
                        <h2 class="title">Game Options</h2>
                        <div class="container-80">
                            <div class="vbox">
                                <div class="hbox space-between">
                                    <label for="SoundVolumeInput">Sound</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        id="SoundVolumeInput"
                                        onChange={(event) => {
                                            props.setSoundVolume(
                                                parseInt(
                                                    event.currentTarget.value,
                                                ),
                                            );
                                        }}
                                    />
                                </div>
                                <br />
                                <div class="hbox space-between">
                                    <label for="MusicVolumeInput">Music</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        id="MusicVolumeInput"
                                        onChange={(event) => {
                                            props.setMusicVolume(
                                                parseInt(
                                                    event.currentTarget.value,
                                                ),
                                            );
                                        }}
                                    />
                                </div>
                                <br />
                                <button
                                    onclick={() => props.navigateTo("back")}
                                >
                                    Exit game
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
