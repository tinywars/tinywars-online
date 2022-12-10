export class AnimationFrame {
    constructor(
        public x: number,
        public y: number,
        public w: number,
        public h: number,
    ) {}
}

export type AnimationStates<T extends string> = Record<T, AnimationFrame[]>;
export type GetAnimationKey<T> = T extends AnimationStates<infer S> ? S : never;

export class AnimationEngine<
    TStateKey extends string = string,
> {
    private loop = false;
    private frameIndex = 0;
    private frameTimer = 0;
    private frameTimeout = 0;
    private currentState: TStateKey = "" as TStateKey;

    private constructor(private states: AnimationStates<string>, fps: number) {
        this.frameTimeout = 1 / fps;
    }

    static fromStates<
        T extends Record<string, AnimationFrame[]>,
        TStateName extends Extract<keyof T, string>
    >(states: T, fps: number): AnimationEngine<TStateName> {
        return new this(states, fps)
    }

    /**
     * Update current frame as time passes
     * @param dt Delta time since last call
     * @returns True if animation is playing, false if animation just ended
     */
    update(dt: number): boolean {
        this.frameTimer -= dt;
        if (this.frameTimer > 0) return true; // animation is still playing

        if (this.states[this.currentState].length === this.frameIndex + 1) {
            if (this.loop) this.frameIndex = 0;
            else return false; // animation state just ended and is not looping
        } else this.frameIndex++;

        // reset timer
        this.frameTimer = this.frameTimeout;

        return true;
    }

    setState(name: TStateKey, looping = false, reset = false) {
        if (this.states[name] === undefined)
            throw new Error(
                `Programatic error: Trying to use non-existent animation state ${
                    name as string
                }`,
            );

        this.loop = looping;

        // Repeated setting of the animation to the same values does nothing
        if (this.currentState === name && !reset) return;

        this.currentState = name;
        this.frameIndex = 0;
        this.frameTimer = this.frameTimeout;
    }

    getCurrentFrame(): AnimationFrame {
        const state = this.states[this.currentState];
        return state[this.frameIndex];
    }
}

