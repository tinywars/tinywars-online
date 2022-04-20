import "./style.css";
import { GameContext } from "./game/game-context";
import { EventQueue } from "./events/event-queue";
import { DebugEvent } from "./events/game-event";
import { Vector } from "./utility/vector";

import { App } from "./app-states/app";
import { AppStateGame } from "./app-states/app-state-game";

const FPS = 60;

// TODO: environment setup

const app = new App();
app.pushState(new AppStateGame(app));
app.run(FPS);

/*
const app = document.querySelector<HTMLDivElement>("#app")!;
const a = {
    b: 1,
    c: 2,
};

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`;
*/
