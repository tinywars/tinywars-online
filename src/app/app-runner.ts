import { Releasable } from "./releasable";

/**
 * Generic class that provides frame time contants
 * computed from FPS and single point of entry for
 * running something.
 */
export abstract class AppRunner extends Releasable {
    protected frameTimeSec = 0;
    protected frameTimeMsec = 0;

    run(fps: number) {
        this.frameTimeSec = 1 / fps;
        this.frameTimeMsec = this.frameTimeSec * 1000;
        this.runInternal();
    }

    protected abstract runInternal(): void;
}
