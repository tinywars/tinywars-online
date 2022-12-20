import { App } from "./app";
import { AppRunner } from "./app-runner";

export class LocalAppRunner extends AppRunner {
    private intervalHandle = -1;

    constructor(private app: App) {
        super();
    }

    protected override runInternal(): void {
        this.intervalHandle = setInterval(() => {
            const start = Date.now();
            this.app.updateLogic(this.frameTimeSec);

            this.reportStats({
                simulationTime: Date.now() - start,
                latency: 0,
            })
        }, this.frameTimeMsec);
    }

    override release(): void {
        clearInterval(this.intervalHandle);
        this.app.release();
    }
}
