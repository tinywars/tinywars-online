import { TinywarsSocket } from "../networking/types";
import { App } from "./app";
import { AppRunner } from "./app-runner";

/**
 * Wrapper class for App which dictates when should
 * next update be called. This is dependent on
 * 1) setInterval trigger
 * 2) inputs from all players have been connected
 */
export class NetAppRunner extends AppRunner {
    private inputsReceived = false;
    private nextUpdateAvailable = false;

    constructor(private app: App, private socket: TinywarsSocket) {
        super();
    }

    protected runInternal(): void {
        this.socket.on("inputsCollected", () => {
            this.registerAllFrameInputs();
        });
        setInterval(this.notifyNextUpdateAvailable, this.frameTimeMsec);
    }

    private registerAllFrameInputs(/*...params...*/) {
        // TODO: inputs
        this.updateLogic();
    }

    private notifyNextUpdateAvailable = () => {
        this.nextUpdateAvailable = true;
        this.updateLogic();
    };

    private updateLogic() {
        if (!this.inputsReceived || !this.nextUpdateAvailable) return;
        this.app.updateLogic(this.frameTimeSec);

        this.inputsReceived = false;
        this.nextUpdateAvailable = false;
    }
}
