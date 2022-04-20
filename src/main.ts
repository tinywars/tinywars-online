import "./style.css";
import { GameContext } from "./game/game-context";
import { EventQueue } from "./events/event-queue";
import { DebugEvent } from "./events/game-event";

const context: GameContext = {
  log: (msg: string): void => {
    console.log(msg);
  }
};

const queue: EventQueue = new EventQueue();
queue.add(DebugEvent("message"));
queue.process(context);

const app = document.querySelector<HTMLDivElement>("#app")!;
const a = {
  b: 1,
  c: 2,
};

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`;
