import { assert } from "chai";
import { Controller } from "../controllers/controller";
import { GameEventEmitter } from "../events/event-emitter";
import { EventQueue } from "../events/event-queue";
import { Effect } from "../game/effect";
import { GameContext } from "../game/game-context";
import { GameSettings } from "../game/game-settings";
import { Obstacle } from "../game/obstacle";
import { Player } from "../game/player";
import { Powerup } from "../game/powerup";
import { Projectile } from "../game/projectile";
import { AnimationEngine } from "../utility/animation";
import { FastArray } from "../utility/fast-array";
import {
    effectAnimationMock, obstacleAnimationMock,
    playerAnimationMock,
    powerupAnimationMock,
    projectileAnimationMock
} from "./animation-frame";

export function getMockGameContext(options: {
    numPlayers: number;
    numProjectiles: number;
    numObstacles: number;
    numPowerups: number;
    numEffects: number;
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
                    AnimationEngine.fromStates(playerAnimationMock, 2),
                    options.eventQueue,
                ),
        ),
        projectiles: new FastArray<Projectile>(
            options.numProjectiles,
            (index) =>
                new Projectile(
                    index,
                    AnimationEngine.fromStates(projectileAnimationMock, 2),
                ),
        ),
        obstacles: new FastArray<Obstacle>(
            options.numObstacles,
            (index) =>
                new Obstacle(
                    index,
                    AnimationEngine.fromStates(obstacleAnimationMock, 2),
                ),
        ),
        powerups: new FastArray<Powerup>(
            options.numPowerups,
            (index) =>
                new Powerup(
                    index,
                    AnimationEngine.fromStates(powerupAnimationMock, 2),
                ),
        ),
        effects: new FastArray<Effect>(
            options.numEffects,
            (index) =>
                new Effect(
                    index,
                    AnimationEngine.fromStates(effectAnimationMock, 2),
                ),
        ),
        duration: 0,
        eventQueue: options.eventQueue,
        eventEmitter: new GameEventEmitter(),
        scores: [0, 0, 0, 0],
        wins: [0, 0, 0, 0],
        log: (msg: string) => {
            console.log(msg);
        },
    };
}
