import { App } from "./app";
import { Releasable } from "./releasable";

export interface AppStats {
    simulationTime: number;
    latency: number;
}

function NullCallback() { /* null */ }

/**
 * Generic class that provides frame time contants
 * computed from FPS and single point of entry for
 * running something.
 */
export abstract class AppRunner extends Releasable {
    protected static UNLIMITED = -1;

    protected frameTimeSec = 0;
    protected frameTimeMsec = 0;
    protected reportStats: (stats: AppStats) => void;

    protected pointLimitReachedButFinalCountdownNotElapsed = true;
    protected pointLimit = AppRunner.UNLIMITED;
    protected limitReachedHandler: (scores: number[]) => void;

    constructor() {
        super();
        this.reportStats = NullCallback;
        this.limitReachedHandler = NullCallback;
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

    protected evaluteScores(app: App) {
        const endgameStatus = app.getEndgameStatus();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const maxScore = endgameStatus.scores.sort().reverse().at(0)!;

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
