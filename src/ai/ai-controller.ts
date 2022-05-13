import { Controller } from "../utility/controller";

export class AiPoweredController extends Controller {
    private inputs: Record<number, boolean> = {};

    protected isInputPressed(code: number): boolean {
        return this.inputs[code];
    }

    protected getAxisValue(): number {
        return 0;
    }

    releaseKey(code: number): void {
        this.inputs[code] = false;
    }

    pressKey(code: number): void {
        this.inputs[code] = true;
    }
}
