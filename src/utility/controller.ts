export interface Controller {
    isKeyPressed(code: number):boolean;
    releaseKey(code: number):void;
}