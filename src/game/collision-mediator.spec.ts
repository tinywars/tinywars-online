import { expect } from "chai";
import { SimpleController } from "../controllers/simple-controller";
import { EventQueue } from "../events/event-queue";
import { PowerupType } from "../game/powerup";
import { getMockGameContext } from "../test/game-context";
import { getMockSettings } from "../test/game-settings";
import { Vector } from "../utility/vector";
import { CollisionMediator } from "./collision-mediator";
import { GameContext } from "./game-context";
import { GameSettings } from "./game-settings";
import { KeyCode } from "./key-codes";

describe("CollisionMediator", () => {
    let controller: SimpleController;
    let eventQueue: EventQueue;
    let settings: GameSettings;
    let gameContext: GameContext;

    beforeEach(() => {
        controller = new SimpleController();
        eventQueue = new EventQueue();
        settings = getMockSettings();
        gameContext = getMockGameContext({
            numPlayers: 1,
            numProjectiles: 64,
            numObstacles: 8,
            numPowerups: 1,
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
        const INITIAL_HEALTH = 2;

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
                initialHealth: INITIAL_HEALTH,
            });

            CollisionMediator.processCollisions(gameContext);
            eventQueue.process(gameContext);

            expect(gameContext.projectiles.getSize()).to.equal(1);
            expect(gameContext.players.getSize()).to.equal(1);
            expect(gameContext.players.getItem(0).getHealth()).to.equal(
                INITIAL_HEALTH,
            );
        });

        it("destroys projectile and damages player on collision", () => {
            gameContext.projectiles.getItem(0).spawn({
                position: new Vector(0, 0),
                forward: Vector.zero(), // irrelevant
                damage: 1,
                selfDestructTimeout: Infinity,
            });

            gameContext.players.getItem(0).spawn({
                position: new Vector(5, 5),
                maxEnergy: 1,
                initialEnergy: 1,
                initialHealth: INITIAL_HEALTH,
            });

            CollisionMediator.processCollisions(gameContext);
            eventQueue.process(gameContext);

            expect(gameContext.projectiles.getSize()).to.equal(0);
            expect(gameContext.players.getSize()).to.equal(1);
            expect(gameContext.players.getItem(0).getHealth()).to.equal(
                INITIAL_HEALTH - 1,
            );
        });
    });

    describe("player <-> obstacle collisions", () => {
        beforeEach(() => {
            gameContext.players.grow();
            gameContext.obstacles.grow();
        });

        it("does nothing if there are no collisions", () => {
            gameContext.players.getItem(0).spawn({
                position: Vector.zero(),
                maxEnergy: 1,
                initialEnergy: 1,
                initialHealth: 1,
            });

            gameContext.obstacles.getItem(0).spawn({
                position: new Vector(100, 100),
                forward: Vector.zero(),
                playerIndex: -1,
            });

            CollisionMediator.processCollisions(gameContext);
            eventQueue.process(gameContext);

            expect(gameContext.players.getSize()).to.equal(1);
        });

        it("destroys player and moves obstacle on collision", () => {
            gameContext.players.getItem(0).spawn({
                position: Vector.zero(),
                maxEnergy: 1,
                initialEnergy: 1,
                initialHealth: 1,
            });

            gameContext.obstacles.getItem(0).spawn({
                position: new Vector(10, 10),
                forward: Vector.zero(),
                playerIndex: -1,
            });

            // Initialize player forward vector
            controller.pressKey(KeyCode.Up);
            gameContext.players.getItem(0).update(1 / 60, gameContext);

            // Handle colisions
            CollisionMediator.processCollisions(gameContext);
            eventQueue.process(gameContext);

            expect(gameContext.players.getSize()).to.equal(0);
            const fwd = gameContext.obstacles.getItem(0).getForward();
            expect(fwd.x, "Obstacle forward.x has changed").to.be.approximately(
                (settings.PLAYER_FORWARD_SPEED * settings.PLAYER_MASS) /
                    settings.OBSTACLE_MASS,
                0.001,
            );
            expect(fwd.y, "Obstacle forward.y has not changed").to.equal(0);
        });
    });

    describe("obstacle <-> obstacle collisions", () => {
        const INIT_FWD1 = new Vector(10, 10);
        const INIT_FWD2 = new Vector(-10, -10);

        beforeEach(() => {
            gameContext.obstacles.grow();
            gameContext.obstacles.grow();
        });

        it("does nothing if there are no collisions", () => {
            gameContext.obstacles.getItem(0).spawn({
                position: Vector.zero(),
                forward: INIT_FWD1.copy(),
                playerIndex: -1,
            });

            gameContext.obstacles.getItem(1).spawn({
                position: new Vector(100, 100),
                forward: INIT_FWD2.copy(),
                playerIndex: -1,
            });

            CollisionMediator.processCollisions(gameContext);
            eventQueue.process(gameContext);

            expect(
                gameContext.obstacles.getItem(0).getForward().toString(),
                "Obstacle 1 keeps its forward",
            ).to.equal("[10, 10]");

            expect(
                gameContext.obstacles.getItem(1).getForward().toString(),
                "Obstacle 2 keeps its forward",
            ).to.equal("[-10, -10]");
        });

        it("bounces obstacles from each other on collision", () => {
            // Forward vectors go against each other
            gameContext.obstacles.getItem(0).spawn({
                position: new Vector(0, 0),
                forward: INIT_FWD1.copy(),
                playerIndex: -1,
            });

            gameContext.obstacles.getItem(1).spawn({
                position: new Vector(10, 10),
                forward: INIT_FWD2.copy(),
                playerIndex: -1,
            });

            CollisionMediator.processCollisions(gameContext);
            eventQueue.process(gameContext);

            const fwd1 = gameContext.obstacles.getItem(0).getForward();
            const fwd2 = gameContext.obstacles.getItem(1).getForward();
            expect(fwd1.x, "Obstacle1 gains forward.x of obstacle2").to.equal(
                INIT_FWD2.x * settings.OBSTACLE_BOUNCE_SLOW_FACTOR,
            );
            expect(fwd1.x, "Obstacle1 gains forward.y of obstacle2").to.equal(
                INIT_FWD2.y * settings.OBSTACLE_BOUNCE_SLOW_FACTOR,
            );
            expect(fwd2.x, "Obstacle2 gains forward.x of obstacle1").to.equal(
                INIT_FWD1.x * settings.OBSTACLE_BOUNCE_SLOW_FACTOR,
            );
            expect(fwd2.x, "Obstacle2 gains forward.y of obstacle1").to.equal(
                INIT_FWD1.y * settings.OBSTACLE_BOUNCE_SLOW_FACTOR,
            );
            expect(
                gameContext.obstacles
                    .getItem(0)
                    .getCollider()
                    .collidesWith(
                        gameContext.obstacles.getItem(1).getCollider(),
                    ),
            ).to.be.false;
        });
    });

    describe("player <-> powerup collisions", () => {
        const INITIAL_HEALTH = 1;

        beforeEach(() => {
            gameContext.players.grow();
            gameContext.powerups.grow();
        });

        it("does nothing if there are no collisions", () => {
            gameContext.players.getItem(0).spawn({
                position: Vector.zero(),
                maxEnergy: 1,
                initialEnergy: 1,
                initialHealth: INITIAL_HEALTH,
            });

            gameContext.powerups.getItem(0).spawn({
                position: Vector.outOfView(),
                type: PowerupType.Heal,
            });

            CollisionMediator.processCollisions(gameContext);
            eventQueue.process(gameContext);

            expect(gameContext.players.getItem(0).getHealth()).to.equal(
                INITIAL_HEALTH,
            );
            expect(gameContext.powerups.getSize()).to.equal(1);
        });

        it("destroys powerup and applies it to player", () => {
            gameContext.players.getItem(0).spawn({
                position: Vector.zero(),
                maxEnergy: 1,
                initialEnergy: 1,
                initialHealth: INITIAL_HEALTH,
            });

            gameContext.powerups.getItem(0).spawn({
                position: Vector.zero(),
                type: PowerupType.Heal,
            });

            CollisionMediator.processCollisions(gameContext);
            eventQueue.process(gameContext);

            expect(gameContext.players.getItem(0).getHealth()).to.equal(
                INITIAL_HEALTH + 1,
            );
            expect(gameContext.powerups.getSize()).to.equal(0);
        });
    });
});
