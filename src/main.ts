import "./style.css";
import { GameContext } from "./game/game-context";
import { EventQueue } from "./events/event-queue";
import { DebugEvent } from "./events/game-event";

const context: GameContext = {
  eventQueue: new EventQueue(),
  log: (msg: string): void => {
    console.log(msg);
  }
};

context.eventQueue.add(DebugEvent("message"));
context.eventQueue.process(context);

const app = document.querySelector<HTMLDivElement>("#app")!;
const a = {
  b: 1,
  c: 2,
};

var arr = [];
arr.push(1);
arr.push(2);

for (let i = 0; i < arr.length; i++) {
  if (arr[i] === 1)
    arr.push(2);
  console.log(arr[i]);
}

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`;
