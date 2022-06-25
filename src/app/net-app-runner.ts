import { Controller } from "../controllers/controller";
import { SimpleController } from "../controllers/simple-controller";
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

    constructor(
        private app: App,
        private socket: TinywarsSocket,
        private netControllers: SimpleController[],
        private myController: Controller,
        private clientId: string,
    ) {
        super();
    }

    protected override runInternal(): void {
        setInterval(this.notifyNextUpdateAvailable, this.frameTimeMsec);
        this.socket.on("gameInputsCollected", (inputs: boolean[][]) => {
            this.registerAllFrameInputs(inputs);
        });
        this.socket.emit(
            "gameInputGathered",
            this.clientId,
            this.myController.getSnapshot(),
        );
    }

    private registerAllFrameInputs(inputs: boolean[][]) {
        for (let i = 0; i < this.netControllers.length; i++) {
            inputs[i].forEach((pressed, code) => {
                if (pressed) this.netControllers[i].pressKey(code);
                else this.netControllers[i].releaseKey(code);
            });
        }
        this.inputsReceived = true;
        this.updateLogic();
    }

    private notifyNextUpdateAvailable = () => {
        this.nextUpdateAvailable = true;
        this.updateLogic();
    };

    private updateLogic() {
        if (!this.inputsReceived || !this.nextUpdateAvailable) return;
        this.inputsReceived = false;
        this.nextUpdateAvailable = false;

        this.socket.emit(
            "gameInputGathered",
            this.clientId,
            this.myController.getSnapshot(),
        );
        this.app.updateLogic(this.frameTimeSec);
    }
}
