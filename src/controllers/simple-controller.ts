import { Controller } from "./controller";

/**
 * Controller without any internal logic. Any input
 * can be toggled at will.
 *
 * Used for AI, mocks and networking
 */
export class SimpleController extends Controller {
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
