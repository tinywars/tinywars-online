import { render } from "solid-js/web";

import "../assets/font/pixel-art-font.css";
import "./index.css";
import { AppTopLevel } from "./ui/App";

render(
    () => (
        <AppTopLevel />
    ),
    document.getElementById("root") as HTMLElement,
);
