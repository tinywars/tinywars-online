import { expect } from "chai";
import { AiPoweredController } from "../ai/ai-controller";
import { EventQueue } from "../events/event-queue";
import { AnimationEngine, AnimationFrame } from "../utility/animation";
import { Vector } from "../utility/vector";
import { Player } from "./player";
import { KeyCode } from "./key-codes";
import { GameContext } from "./game-context";
import { GameSettings, getMockSettings } from "./game-settings";
import { FastArray } from "../utility/fast-array";
import { Projectile } from "./projectile";
import { Obstacle } from "./obstacle";

const playerAnimationMock = {
    idle: [new AnimationFrame(1, 2, 3, 4)],
    hit: [new AnimationFrame(5, 6, 7, 8)],
};

const projectileAnimationMock = {
    idle: [new AnimationFrame(9, 10, 11, 12)],
};

const obstacleAnimationMock = {
    idle0: [new AnimationFrame(13, 14, 15, 16)],
    idle1: [new AnimationFrame(17, 18, 19, 20)],
    wreck0: [new AnimationFrame(21, 22, 23, 24)],
    wreck1: [new AnimationFrame(25, 26, 27, 28)],
    wreck2: [new AnimationFrame(29, 30, 31, 32)],
    wreck3: [new AnimationFrame(33, 34, 35, 36)],
};

describe("Player", () => {
    let controller: AiPoweredController;
    let eventQueue: EventQueue;
    let player: Player;
    let settings: GameSettings;
    let gameContext: GameContext;

    beforeEach(() => {
        controller = new AiPoweredController();
        controller.releaseKey(KeyCode.Up);
        controller.releaseKey(KeyCode.Down);
        controller.releaseKey(KeyCode.Left);
        controller.releaseKey(KeyCode.Right);
        controller.releaseKey(KeyCode.Shoot);
        controller.releaseKey(KeyCode.Action);
        controller.releaseKey(KeyCode.Rotation);

        eventQueue = new EventQueue();

        settings = getMockSettings();

        gameContext = {
            settings: settings,
            players: new FastArray<Player>(
                1,
                (index) =>
                    new Player(
                        index,
                        controller,
                        new AnimationEngine(playerAnimationMock, 2),
                        eventQueue,
                    ),
            ),
            projectiles: new FastArray<Projectile>(
                64,
                (index) =>
                    new Projectile(
                        index,
                        new AnimationEngine(projectileAnimationMock, 2),
                    ),
            ),
            obstacles: new FastArray<Obstacle>(
                8,
                (index) =>
                    new Obstacle(
                        index,
                        new AnimationEngine(obstacleAnimationMock, 2),
                    ),
            ),
            eventQueue: eventQueue,
            log: (msg: string) => {
                console.log(msg);
            },
        };

        gameContext.players.grow();
        player = gameContext.players.getItem(0);
    });

    it("#spawn", () => {
        player.spawn({
            position: new Vector(42, 69),
            initialHealth: 1,
            initialEnergy: 2,
            maxEnergy: 3,
        });

        expect(player.getCoords().position.x).to.equal(42);
        expect(player.getCoords().position.y).to.equal(69);
        expect(player.getCoords().angle).to.equal(0);
        expect(player.getForward().x).to.equal(0);
        expect(player.getForward().y).to.equal(0);
        expect(player.getHealth()).to.equal(1);
        expect(player.getEnergy()).to.equal(2);
        expect(player.getCoords().frame.x).to.equal(1);
        expect(player.getCoords().frame.y).to.equal(2);
    });

    it("#despawn", () => {
        player.spawn({
            position: new Vector(42, 69),
            initialHealth: 1,
            initialEnergy: 2,
            maxEnergy: 3,
        });

        player.despawn();

        const outOfView = Vector.outOfView();
        expect(player.getCoords().position.x).to.equal(outOfView.x);
        expect(player.getCoords().position.y).to.equal(outOfView.y);
    });

    describe("#update", () => {
        describe("Shooting", () => {
            const INITIAL_ENERGY = 2;

            beforeEach(() => {
                player.spawn({
                    position: new Vector(42, 69),
                    initialHealth: 1,
                    initialEnergy: INITIAL_ENERGY,
                    maxEnergy: 3,
                });
            });

            it("Shoots when key is pressed and has enough energy", () => {
                controller.pressKey(KeyCode.Shoot);
                player.update(0, gameContext);

                expect(controller.readAttackToggled()).to.be.false;
                expect(player.getEnergy()).to.equal(INITIAL_ENERGY - 1);
                expect(gameContext.eventQueue.events.length).to.equal(1);
                expect(gameContext.eventQueue.events[0].name).to.equal(
                    "SpawnProjectileEvent",
                );
            });

            it("Does not shoot if shoot key is not pressed", () => {
                controller.releaseKey(KeyCode.Shoot);
                player.update(0, gameContext);
                expect(controller.readAttackToggled()).to.be.false;
                expect(player.getEnergy()).to.equal(INITIAL_ENERGY);
                expect(gameContext.eventQueue.events.length).to.equal(0);
            });

            it("Does not shoot if it doesn't have enough energy", () => {
                player.spawn({
                    position: new Vector(42, 69),
                    initialHealth: 1,
                    initialEnergy: 0,
                    maxEnergy: 3,
                });

                controller.pressKey(KeyCode.Shoot);
                player.update(0, gameContext);
                expect(controller.readAttackToggled()).to.be.false;
                expect(player.getEnergy()).to.equal(0);
                expect(gameContext.eventQueue.events.length).to.equal(0);
            });
        });

        describe("#hit", () => {
            const INITIAL_HEALTH = 3;
            beforeEach(() => {
                player.spawn({
                    position: new Vector(42, 69),
                    initialHealth: INITIAL_HEALTH,
                    initialEnergy: 2,
                    maxEnergy: 3,
                });
            });

            it("Loses lives when hit and changes animation", () => {
                player.hit(1);
                expect(player.getHealth()).to.equal(INITIAL_HEALTH - 1);
                expect(player.getCoords().frame.x).to.equal(5);
                expect(player.getCoords().frame.y).to.equal(6);
            });

            it("Dies when damage is greater than remaining lives", () => {
                player.hit(3);
                expect(player.getHealth()).to.equal(0);
                expect(player.getHealth()).to.equal(0);
                expect(player.getCoords().frame.x).to.equal(5);
                expect(player.getCoords().frame.y).to.equal(6);
            });
        });
    });
});
