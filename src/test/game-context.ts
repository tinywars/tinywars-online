import { assert } from "chai";
import { EventQueue } from "../events/event-queue";
import { GameContext } from "../game/game-context";
import { GameSettings } from "../game/game-settings";
import { Obstacle } from "../game/obstacle";
import { Player } from "../game/player";
import { Projectile } from "../game/projectile";
import { AnimationEngine } from "../utility/animation";
import { Controller } from "../utility/controller";
import { FastArray } from "../utility/fast-array";
import {
    obstacleAnimationMock,
    playerAnimationMock,
    projectileAnimationMock,
} from "./animation-frame";

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