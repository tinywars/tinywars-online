export class Timer {
    private value: number;

    constructor(private getInitValue: () => number) {
        this.value = this.getInitValue();
    }

    update(dt: number) {
        if (!this.ended()) this.value -= dt;
    }

    reset() {
        this.value = this.getInitValue();
    }

    ended(): boolean {
        return this.value <= 0;
    }
}
