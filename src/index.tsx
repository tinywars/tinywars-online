import { Router } from "@gh0st-work/solid-js-router";
import { render } from "solid-js/web";

import "../assets/font/pixel-art-font.css";
import "./index.css";
import { AppTopLevel } from "./ui/v2/App";

render(
    () => (
        <Router>
            <AppTopLevel />
        </Router>
    ),
    document.getElementById("root") as HTMLElement,
);
