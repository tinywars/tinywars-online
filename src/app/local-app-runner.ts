import { App } from "./app";
import { AppRunner } from "./app-runner";

export class LocalAppRunner extends AppRunner {
    constructor(private app: App) {
        super();
    }

    protected override runInternal(): void {
        setInterval(() => {
            this.app.updateLogic(this.frameTimeSec);
        }, this.frameTimeMsec);
    }
}
