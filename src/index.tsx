import {
    DefaultRoute,
    Link,
    Route,
    Router,
    Routes
} from "@gh0st-work/solid-js-router";
import { render } from "solid-js/web";

import "./index.css";
import { MainMenu } from "./ui/MainMenu";

const App = () => (
    <Router>
        <Routes>
            <Route path={"/settings"}>
                <div>Settings</div>
                <Link href="/home">back</Link>
                <br />
                <Link href="default">default</Link>
                <br />
                <Link href="advanced">advanced</Link>
                <br />
                <br />
                <div>
                    <Routes>
                        <Route path={"/default"}>Default Settings</Route>
                        <Route path={"/advanced"}>Advanced settings</Route>
                    </Routes>
                </div>
            </Route>
            <Route path={"/"} fallback={true}>
                <div>Home</div>
                <Link href={"/settings/default"}>Go To Settings</Link>
            </Route>
            <DefaultRoute to={"/"} />
        </Routes>
    </Router>
);

render(
    () => (
        <Router>
            <MainMenu />
        </Router>
    ),
    document.getElementById("root") as HTMLElement,
);
