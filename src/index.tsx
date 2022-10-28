import { Router } from "@gh0st-work/solid-js-router";
import { render } from "solid-js/web";

import "./index.css";
import { MainMenu } from "./ui/MainMenu";

render(
    () => (
        <Router>
            <MainMenu />
        </Router>
    ),
    document.getElementById("root") as HTMLElement,
);
