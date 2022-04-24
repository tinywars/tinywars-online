import { Controller } from "./controller";

export class KeyboardController implements Controller {
    private mapping: Record<number, string> = {};

    constructor(private kbState: Record<string, boolean>) {}

    isKeyPressed(code: number):boolean {
        return this.kbState[this.mapping[code]];
    }

    releaseKey(code: number) {
        this.kbState[this.mapping[code]] = false;
    }

    bindKey(key: string, code: number) {
        this.mapping[code] = key;
    }
}