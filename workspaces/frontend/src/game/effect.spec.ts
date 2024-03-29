import { expect } from "chai";
import { EventQueue } from "../events/event-queue";
import { getMockGameContext } from "../test/game-context";
import { getMockSettings } from "../test/game-settings";
import { Vector } from "../utility/vector";
import { Effect, EffectType } from "./effect";
import { GameContext } from "./game-context";
import { GameSettings } from "./game-settings";

describe("Effect", () => {
    let effect: Effect;
    let eventQueue: EventQueue;
    let settings: GameSettings;
    let gameContext: GameContext;

    beforeEach(() => {
        eventQueue = new EventQueue();

        settings = getMockSettings();

        gameContext = getMockGameContext({
            numPlayers: 0,
            numProjectiles: 0,
            numObstacles: 0,
            numPowerups: 0,
            numEffects: 1,
            controllers: [],
            settings: settings,
            eventQueue: eventQueue,
        });

        gameContext.players.grow();
        effect = gameContext.effects.getItem(0);
    });

    describe("#spawn", () => {
        it("Spawns correctly", () => {
            effect.spawn({
                position: new Vector(42, 69),
                rotation: 45,
                type: EffectType.PlayerExplosion,
                forward: new Vector(67, 68),
            });

            expect(effect.getCoords().position.x).to.equal(42);
            expect(effect.getCoords().position.y).to.equal(69);
            expect(effect.getCoords().angle).to.equal(45);
            expect(effect.getCoords().frame.x).to.equal(65);
            expect(effect.getCoords().frame.y).to.equal(66);
            expect(effect.getForward().x).to.equal(67);
            expect(effect.getForward().y).to.equal(68);
        });

        it("Repeated spawning with same type resets animation", () => {
            effect.spawn({
                position: new Vector(42, 69),
                rotation: 45,
                type: EffectType.PlayerExplosion,
                forward: Vector.zero(),
            });

            // Simulate until frame changes
            effect.update(0.51, gameContext);
            expect(effect.getCoords().frame.x).to.equal(69);
            expect(effect.getCoords().frame.y).to.equal(70);

            // Re-spawn, frame should be reset to initial position
            effect.spawn({
                position: new Vector(42, 69),
                rotation: 45,
                type: EffectType.PlayerExplosion,
                forward: Vector.zero(),
            });
            expect(effect.getCoords().frame.x).to.equal(65);
            expect(effect.getCoords().frame.y).to.equal(66);
        });
    });

    describe("#update", () => {
        it("Creates destroy event when animation ends", () => {
            effect.spawn({
                position: new Vector(42, 69),
                rotation: 45,
                type: EffectType.PlayerExplosion,
                forward: Vector.zero(),
            });

            // Simulate until animation ends
            const dt = 0.1;
            for (let i = 0; i < 1.1; i += dt) effect.update(dt, gameContext);

            expect(gameContext.eventQueue.events.length).to.equal(1);
            expect(gameContext.eventQueue.events[0].name).to.equal(
                "DestroyEffectEvent",
            );
        });

        it("Moves forward", () => {
            effect.spawn({
                position: new Vector(0, 0),
                rotation: 0,
                type: EffectType.PlayerExplosion,
                forward: new Vector(10, 10),
            });

            effect.update(1, gameContext);
            expect(effect.getCoords().position.x).to.equal(10);
            expect(effect.getCoords().position.y).to.equal(10);
        });
    });
});
