import { KeyCode } from "../game/key-codes";

export abstract class Controller {
    protected isWaitingForAttackToRelease = false;
    protected isWaitingForActionToRelease = false;

    getThrottleAndSteer(): { throttle: number; steer: number } {
        return {
            throttle: this.getThrottle(),
            steer: this.getSteer(),
        };
    }

    readAttackToggled(): boolean {
        const result = this.isInputPressed(KeyCode.Shoot);

        if (result && this.isWaitingForAttackToRelease) return false;

        this.isWaitingForAttackToRelease = result;
        return result;
    }

    readActionToggled(): boolean {
        const result = this.isInputPressed(KeyCode.Action);

        if (result && this.isWaitingForActionToRelease) return false;
        this.isWaitingForActionToRelease = result;

        return result;
    }

    protected getThrottle(): number {
        if (this.isInputPressed(KeyCode.Up)) return 1;
        else if (this.isInputPressed(KeyCode.Down)) return -1;
        return 0;
    }

    protected getSteer(): number {
        if (this.isInputPressed(KeyCode.Left)) return -1;
        else if (this.isInputPressed(KeyCode.Right)) return 1;
        return this.getAxisValue(KeyCode.Rotation);
    }

    protected abstract isInputPressed(code: number): boolean;
    protected abstract getAxisValue(code: number): number;
}
