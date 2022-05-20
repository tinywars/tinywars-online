import { assert } from "chai";
import { EventQueue } from "../events/event-queue";
import { GameContext } from "../game/game-context";
import { GameSettings } from "../game/game-settings";
import { Obstacle } from "../game/obstacle";
import { Player } from "../game/player";
import { Projectile } from "../game/projectile";
import { AnimationEngine, AnimationFrame } from "./animation";
import { Controller } from "./controller";
import { FastArray } from "./fast-array";

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

export function getMockGameContext(options: {
    numPlayers: number;
    numProjectiles: number;
    numObstacles: number;
    controllers: Controller[];
    settings: GameSettings;
    eventQueue: EventQueue;
}): GameContext {
    assert(
        options.controllers.length === options.numPlayers,
        "Mismatch in number of controllers and players in mock game context!",
    );

    return {
        settings: options.settings,
        players: new FastArray<Player>(
            options.numPlayers,
            (index) =>
                new Player(
                    index,
                    options.controllers[index],
                    new AnimationEngine(playerAnimationMock, 2),
                    options.eventQueue,
                ),
        ),
        projectiles: new FastArray<Projectile>(
            options.numProjectiles,
            (index) =>
                new Projectile(
                    index,
                    new AnimationEngine(projectileAnimationMock, 2),
                ),
        ),
        obstacles: new FastArray<Obstacle>(
            options.numObstacles,
            (index) =>
                new Obstacle(
                    index,
                    new AnimationEngine(obstacleAnimationMock, 2),
                ),
        ),
        eventQueue: options.eventQueue,
        log: (msg: string) => {
            console.log(msg);
        },
    };
}
