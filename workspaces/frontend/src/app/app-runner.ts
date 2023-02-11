import { noop } from "lodash";
import { App } from "./app";
import { Releasable } from "./releasable";

export interface AppStats {
    simulationTime: number;
    latency: number;
}

/**
 * Generic class that provides frame time contants
 * computed from FPS and single point of entry for
 * running something.
 */
export abstract class AppRunner extends Releasable {
    protected static UNLIMITED = -1;

    protected frameTimeSec = 0;
    protected frameTimeMsec = 0;
    protected reportStats: (stats: AppStats) => void = noop;

    protected pointLimitReachedButFinalCountdownNotElapsed = true;
    protected pointLimit = AppRunner.UNLIMITED;
    protected limitReachedHandler: (scores: number[]) => void = noop;

    constructor() {
        super();
    }

    run(fps: number) {
        this.frameTimeSec = 1 / fps;
        this.frameTimeMsec = this.frameTimeSec * 1000;
        this.runInternal();
    }

    protected abstract runInternal(): void;

    public installStatsReporter(reportStats: (stats: AppStats) => void) {
        this.reportStats = reportStats;
    }

    public setPointLimit(limit: number, limitReachedHandler: (scores: number[]) => void) {
        this.pointLimit = limit;
        this.limitReachedHandler = limitReachedHandler;
    }

    protected checkPointLimitReached(app: App) {
        const endgameStatus = app.getEndgameStatus();
        const maxScore = Math.max(...endgameStatus.scores);

        if (this.pointLimit <= maxScore)
        {
            if (this.pointLimitReachedButFinalCountdownNotElapsed && !endgameStatus.endgameTriggered)
                return;
            else if (this.pointLimitReachedButFinalCountdownNotElapsed && endgameStatus.endgameTriggered) {
                this.pointLimitReachedButFinalCountdownNotElapsed = false;
            }
            else if (!endgameStatus.endgameTriggered) {
                this.limitReachedHandler(endgameStatus.scores);
            }
        }
    }
}
