export interface AppState {
    updateLogic(dt: number): void;
    draw(context2d: CanvasRenderingContext2D): void;
}