import { Identity } from "../ts/identity.type";
import { KeyOfType } from "../ts/key-of-type.type";

interface LoopingAnimationState {
    length: number;
    loop: true;
}

interface TransientAnimationState<K extends string> {
    length: number;
    loop?: false;
    next: K;
}

type AnimationState<K extends string> =
    | LoopingAnimationState
    | TransientAnimationState<K>;

type AnimationStates<
    TStates extends Record<string, any> = Record<string, any>,
> = Record<string, AnimationState<Extract<keyof TStates, string>>>;

const isLoopingState = <T extends string>(
    state: AnimationState<T>,
): state is LoopingAnimationState => !!state.loop;

// eslint-disable-next-line @typescript-eslint/ban-types
export class AnimationStatesBuilder<TStates extends AnimationStates = {}> {
    private states = {} as TStates;

    addState<
        N extends string,
        AS extends AnimationState<Extract<keyof TStates, string>>,
    >(
        name: N,
        state: AS,
    ): AnimationStatesBuilder<TStates & { [key in N]: typeof state }> {
        this.states[name] = state as any;
        return this as any;
    }

    getStates(): Identity<TStates> {
        return this.states as any;
    }
}

export class AnimationEngine2<TStates extends AnimationStates> {
    private loop = false;
    private frameIndex = 0;
    private frameTimer = 0;
    private frameTimeout = 0;
    private currentStateName: keyof TStates;
    private onFinishedCallback: () => void = () => undefined;

    private constructor(public states: TStates, fps: number) {
        this.frameTimeout = 1 / fps;
        this.currentStateName = Object.keys(states)[0] as keyof typeof states;
    }

    static fromStates<AS extends AnimationStates>(
        states: AS & AnimationStates<AS>,
    ) {
        return {
            withFPS: (fps: number) =>
                new AnimationEngine2<AS>(states as AS, fps),
        };
    }

    update(dt: number): boolean {
        this.frameTimer -= dt;
        if (this.frameTimer > 0) return true; // animation is still playing

        const state = this.states[this.currentStateName];
        if (state.length === this.frameIndex + 1) {
            if (isLoopingState(state)) this.frameIndex = 0;
            else {
                // animation state just ended and is not looping
                this.onFinishedCallback();
                this.onFinishedCallback = () => undefined;
                this.setState(state.next as any);
                return false;
            }
        } else this.frameIndex++;

        // reset timer
        this.frameTimer = this.frameTimeout;

        return true;
    }

    setState<K extends KeyOfType<TStates, LoopingAnimationState>>(
        name: K,
    ): void;
    setState<K extends KeyOfType<TStates, TransientAnimationState<string>>>(
        name: K,
        onFinished?: () => void,
    ): void;
    setState(name: keyof TStates, onFinished?: () => void): void {
        // Repeated setting of the animation to the same values does nothing
        if (onFinished) {
            this.onFinishedCallback = onFinished ?? (() => undefined);
        }
        if (this.currentStateName === name) return;

        const state = this.states[name];
        if (state === undefined)
            throw new Error(
                "Programatic error: Trying to use non-existent animation state " +
                    name,
            );

        this.currentStateName = name;
        this.frameIndex = 0;
        this.frameTimer = this.frameTimeout;
    }

    getCurrentState() {
        return {
            name: this.currentStateName,
            frameIndex: this.frameIndex,
        };
    }
}

const states = new AnimationStatesBuilder()
    .addState("idle", { length: 4, loop: true })
    .addState("hit", { length: 2, next: "idle" })
    .getStates();

const ae2 = AnimationEngine2.fromStates(states).withFPS(4);
ae2.setState("hit");
