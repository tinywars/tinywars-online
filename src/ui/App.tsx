import { Accessor, createSignal, JSX, onMount, Setter } from "solid-js";

export function EmptyComponent() {
    return (
        <>
            <h1>404</h1>
            <div>Empty component</div>
        </>
    );
}

export abstract class AppState {
    constructor(protected app: AppController) {}

    abstract renderTo(component: Accessor<JSX.Element>): void;

    abstract navigateTo(path: string): void;
}

class NullAppState extends AppState {
    constructor(app: AppController) {
        super(app);
    }

    override renderTo(componentSetter: Setter<JSX.Element>): void {
        componentSetter(EmptyComponent);
    }

    override navigateTo(): void {
        /* intentionally left blank */
    }
}

export class AppController {
    private stateStack: AppState[] = [];

    constructor(private setActiveComponent: Setter<JSX.Element>) {
        this.pushState(new NullAppState(this));
    }

    topState(): AppState {
        return this.stateStack[this.stateStack.length - 1];
    }

    /**
     * Add new AppState to memory and trigger re-render of view
     */
    pushState(state: AppState) {
        this.stateStack.push(state);
        this.topState().renderTo(this.setActiveComponent);
    }

    /**
     * Remove top level AppState from memory and trigger re-render of view
     */
    popState() {
        this.stateStack.pop();
        this.topState().renderTo(this.setActiveComponent);
    }
}

class MainMenuState extends AppState {
    constructor(app: AppController) {
        super(app);
    }

    override renderTo(component: Accessor<JSX.Element>): void {
        // This is a lot of boiler plate :( but I can pass in everything I need to views
        component(() =>
            MainMenuView({
                navigateTo: (p: string) => {
                    this.navigateTo(p);
                },
            }),
        );
    }

    override navigateTo(path: string): void {
        // Enum is probably a better option here, but that would not be compatible with inheritance
        console.log(`MainMenuState:navigateTo(${path})`);
        // I can pass whatever I need to newly created states
        if (path === "local") this.app.pushState(new LocalLobbyState(this.app));
    }
}

function MainMenuView(props: { navigateTo: (path: string) => void }) {
    return (
        <>
            <h1>Main Menu</h1>
            <button onclick={() => props.navigateTo("local")}>
                Local Game
            </button>
            <button onclick={() => props.navigateTo("network")}>
                Network Game
            </button>
        </>
    );
}

class LocalLobbyState extends AppState {
    constructor(app: AppController) {
        super(app);
    }

    override renderTo(component: Accessor<JSX.Element>): void {
        component(() =>
            LocalLobbyView({
                navigateTo: (p: string) => {
                    this.navigateTo(p);
                },
            }),
        );
    }

    override navigateTo(path: string): void {
        console.log(`LocalLobbyState:navigateTo(${path})`);
        if (path === "back") this.app.popState();
    }
}

function LocalLobbyView(props: { navigateTo: (path: string) => void }) {
    return (
        <>
            <h1>Local Lobby</h1>
            <button onclick={() => props.navigateTo("back")}>Go back</button>
        </>
    );
}

export function AppTopLevel() {
    const [activeComponent, setActiveComponent] = createSignal(EmptyComponent);
    const controller = new AppController(setActiveComponent);

    onMount(() => {
        controller.pushState(new MainMenuState(controller));
    });

    return <>{activeComponent()}</>;
}
