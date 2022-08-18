import { Component, createSignal, Match, Switch } from "solid-js";
import { Game } from "./ui/Game";

const App: Component = () => {
    const [isGameShown, setIsGameShown] = createSignal(false);
    console.log("Starting app");
    return (
        <div>
            <Switch fallback={<div>Click to show game</div>}>
                <Match when={isGameShown()}>
                    <Game />
                </Match>
            </Switch>
            <button onClick={() => setIsGameShown(!isGameShown())}>
                {isGameShown() ? "Hide game" : "Show game"}
            </button>
        </div>
    );
};

export default App;
