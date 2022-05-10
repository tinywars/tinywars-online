export interface Controller {
    isKeyPressed(code: number): boolean;
    /**
     * @returns number from interval <-1,1>
     */
    getAxisValue(code: number): number;
    releaseKey(code: number): void;
}
