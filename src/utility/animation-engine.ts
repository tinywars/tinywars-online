/* eslint-disable @typescript-eslint/no-explicit-any */

interface AnimationState<K extends string> {
    length: number;
    loop?: boolean;
    nextState?: K;
}

type AnimationStates<
    TStates extends Record<string, any> = Record<string, any>,
> = Record<string, AnimationState<Extract<keyof TStates, string>>>;

export function createAnimationsStates<AS extends AnimationStates>(
    states: AS & AnimationStates<AS>,
): AS {
    return states;
}

export class AnimationEngine2<TStates extends AnimationStates> {
    private loop = false;
    private frameIndex = 0;
    private frameTimer = 0;
    private frameTimeout = 0;
    private currentStateName: keyof TStates;

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

        if (this.states[this.currentStateName].length === this.frameIndex + 1) {
            if (this.loop) this.frameIndex = 0;
            else return false; // animation state just ended and is not looping
        } else this.frameIndex++;

        // reset timer
        this.frameTimer = this.frameTimeout;

        return true;
    }

    setState(name: keyof TStates) {
        // Repeated setting of the animation to the same values does nothing
        if (this.currentStateName === name) return;

        const state = this.states[name];
        if (state === undefined)
            throw new Error(
                "Programatic error: Trying to use non-existent animation state " +
                    name,
            );

        this.loop = !!state.loop;
        this.currentStateName = name;
        this.frameIndex = 0;
        this.frameTimer = this.frameTimeout;
    }
}

const ae = AnimationEngine2.fromStates({
    idle: {
        length: 4,
        loop: true,
    },
    hit: {
        length: 2,
        nextState: "idle",
    },
}).withFPS(60);

ae.setState("hit");

const states = createAnimationsStates({
    a: {
        length: 1,
    },
    b: {
        length: 3,
    },
});

const ae2 = AnimationEngine2.fromStates(states).withFPS(4);
ae2.setState("");
