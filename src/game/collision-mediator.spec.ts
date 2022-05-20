import { expect } from "chai";
import { AiPoweredController } from "../ai/ai-controller";
import { EventQueue } from "../events/event-queue";
import { getMockGameContext } from "../utility/mocks";
import { Vector } from "../utility/vector";
import { CollisionMediator } from "./collision-mediator";
import { GameContext } from "./game-context";
import { GameSettings, getDefaultSettings } from "./game-settings";

describe("CollisionMediator", () => {
    let controller: AiPoweredController;
    let eventQueue: EventQueue;
    let settings: GameSettings;
    let gameContext: GameContext;

    beforeEach(() => {
        controller = new AiPoweredController();
        eventQueue = new EventQueue();
        settings = getDefaultSettings();
        gameContext = getMockGameContext({
            numPlayers: 1,
            numProjectiles: 64,
            numObstacles: 8,
            controllers: [controller],
            settings: settings,
            eventQueue: eventQueue,
        });
    });

    describe("projectile <-> obstacle collisions", () => {
        const PROJECTILE_FWD = new Vector(0, 100);
        const OBSTACLE_FWD = new Vector(-100, 0);

        beforeEach(() => {
            gameContext.projectiles.grow();
            gameContext.obstacles.grow();
        });

        it("does nothing if there are no collisions", () => {
            gameContext.projectiles.getItem(0).spawn({
                position: new Vector(0, 0),
                forward: PROJECTILE_FWD.copy(),
                damage: 1,
                selfDestructTimeout: Infinity,
            });

            gameContext.obstacles.getItem(0).spawn({
                position: new Vector(100, 100),
                forward: OBSTACLE_FWD.copy(),
                playerIndex: -1,
            });

            CollisionMediator.processCollisions(gameContext);
            eventQueue.process(gameContext);

            expect(gameContext.projectiles.getSize()).to.equal(1);
            const fwd = gameContext.obstacles.getItem(0).getForward();
            expect(fwd.x, "Obstacle forward.x is unchanged").to.equal(-100);
            expect(fwd.y, "Obstacle forward.y is unchanged").to.equal(0);
        });

        it("destroys projectile and moves obstacle on collision", () => {
            gameContext.projectiles.getItem(0).spawn({
                position: new Vector(0, 0),
                forward: PROJECTILE_FWD.copy(),
                damage: 1,
                selfDestructTimeout: Infinity,
            });

            gameContext.obstacles.getItem(0).spawn({
                position: new Vector(10, 10),
                forward: OBSTACLE_FWD.copy(),
                playerIndex: -1,
            });

            CollisionMediator.processCollisions(gameContext);
            eventQueue.process(gameContext);

            expect(gameContext.projectiles.getSize()).to.equal(0);
            const fwd = gameContext.obstacles.getItem(0).getForward();
            expect(fwd.x, "Obstacle forward.x is unchanged").to.equal(-100);
            expect(fwd.y, "Obstacle forward.y has changed").to.be.approximately(
                (PROJECTILE_FWD.y * settings.PROJECTILE_MASS) /
                    settings.OBSTACLE_MASS,
                0.001,
            );
        });
    });

    describe("projectile <-> player collisions", () => {
        beforeEach(() => {
            gameContext.projectiles.grow();
            gameContext.players.grow();
        });

        it("does nothing if there are no collisions", () => {
            gameContext.projectiles.getItem(0).spawn({
                position: new Vector(0, 0),
                forward: Vector.zero(), // irrelevant
                damage: 1,
                selfDestructTimeout: Infinity,
            });

            gameContext.players.getItem(0).spawn({
                position: new Vector(100, 100),
                maxEnergy: 1,
                initialEnergy: 1,
                initialHealth: 1,
            });

            CollisionMediator.processCollisions(gameContext);
            eventQueue.process(gameContext);

            expect(gameContext.projectiles.getSize()).to.equal(1);
            expect(gameContext.players.getSize()).to.equal(1);
            expect(gameContext.players.getItem(0).getHealth()).to.equal(1);
        });

        it("destroys projectile and damages player on collision", () => {
            // TODO: this
        });
    });

    describe("player <-> obstacle collisions", () => {
        beforeEach(() => {
            gameContext.players.grow();
            gameContext.obstacles.grow();
        });

        it("does nothing if there are no collisions", () => {
            // TODO: this
        });

        it("damages player and moves obstacle on collision", () => {
            // TODO: this
        });
    });

    describe("obstacle <-> obstacle collisions", () => {
        beforeEach(() => {
            gameContext.obstacles.grow();
            gameContext.obstacles.grow();
        });

        it("does nothing if there are no collisions", () => {
            // TODO: this
        });

        it("bounces obstacles from each other on collision", () => {
            // TODO: this
            // TODO: test they are not still colliding
        });
    });
});
