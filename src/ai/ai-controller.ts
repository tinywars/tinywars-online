import { Controller } from "../utility/controller";

export class AiPoweredController implements Controller {
    private inputs: Record<number, boolean> = {};

    isKeyPressed(code: number): boolean {
        return this.inputs[code];
    }

    releaseKey(code: number): void {
        this.inputs[code] = false;
    }

    pressKey(code: number): void {
        this.inputs[code] = true;
    }
}
