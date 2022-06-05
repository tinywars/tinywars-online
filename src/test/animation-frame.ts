import { AnimationFrame } from "../utility/animation";

export const playerAnimationMock = {
    idle: [new AnimationFrame(1, 2, 3, 4)],
    hit: [new AnimationFrame(5, 6, 7, 8)],
};

export const projectileAnimationMock = {
    idle: [new AnimationFrame(9, 10, 11, 12)],
};

export const obstacleAnimationMock = {
    idle0: [new AnimationFrame(13, 14, 15, 16)],
    idle1: [new AnimationFrame(17, 18, 19, 20)],
    wreck0: [new AnimationFrame(21, 22, 23, 24)],
    wreck1: [new AnimationFrame(25, 26, 27, 28)],
    wreck2: [new AnimationFrame(29, 30, 31, 32)],
    wreck3: [new AnimationFrame(33, 34, 35, 36)],
};

export const powerupAnimationMock = {
    idle0: [new AnimationFrame(37, 38, 39, 40)],
    idle1: [new AnimationFrame(41, 42, 43, 44)],
    idle2: [new AnimationFrame(45, 46, 47, 48)],
    idle3: [new AnimationFrame(49, 50, 51, 52)],
    idle4: [new AnimationFrame(53, 54, 55, 56)],
    idle5: [new AnimationFrame(57, 58, 59, 60)],
    idle6: [new AnimationFrame(61, 62, 63, 64)],
};
