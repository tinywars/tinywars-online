import { AnimationFrame } from "./animation";
import { Vector } from "./vector";

export interface Coords {
    position: Vector;
    angle: number;
    frame: AnimationFrame;
}
