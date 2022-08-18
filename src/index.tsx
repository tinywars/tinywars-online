/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import { MainMenu } from "./ui/MainMenu";

render(() => <MainMenu />, document.getElementById("root") as HTMLElement);
