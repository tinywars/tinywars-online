export class AnimationFrame {
    constructor(
        public x: number,
        public y: number,
        public w: number,
        public h: number) {}
}

export class AnimationEngine {
    private loop = false;
    private frameIndex = 0;
    private frameTimer = 0;
    private frameTimeout = 0;
    private currentState = "";

    constructor(
        private states: Record<string, AnimationFrame[]>,
        fps: number
    ) {
        this.frameTimeout = 1 / fps;
    }

    /**
     * Update current frame as time passes
     * @param dt Delta time since last call
     * @returns True if animation is playing, false if animation just ended
     */
    update(dt: number): boolean {
        this.frameTimer -= dt;
        if (this.frameTimer > 0)
            return true; // animation is still playing

        if (this.states[this.currentState].length === this.frameIndex + 1) {
            if (this.loop)
                this.frameIndex = 0;
            else
                return false; // animation state just ended and is not looping
        }
        else
            this.frameIndex++;

        // reset timer
        this.frameTimer = this.frameTimeout;

        return true;
    }

    setState(name: string, looping = false) {
        if (this.states[name] === undefined)
            throw "Programatic error: Trying to use non-existent animation state " + name;

        this.loop = looping;

        // Repeated setting of the animation to the same values does nothing
        if (this.currentState === name)
            return;

        this.currentState = name;
        this.frameIndex = 0;
        this.frameTimer = this.frameTimeout;
    }

    getCurrentFrame(): AnimationFrame {
        const state = this.states[this.currentState]!;
        return state[this.frameIndex];
    }
}