import { expect } from "chai";
import { AiPoweredController } from "../ai/ai-controller";
import { EventQueue } from "../events/event-queue";
import { Vector } from "../utility/vector";
import { Player } from "./player";
import { KeyCode } from "./key-codes";
import { GameContext } from "./game-context";
import { GameSettings, getDefaultSettings } from "./game-settings";
import { getMockGameContext } from "../utility/mocks";

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

        settings = getDefaultSettings();

        gameContext = getMockGameContext({
            numPlayers: 1,
            numProjectiles: 64,
            numObstacles: 8,
            controllers: [controller],
            settings: settings,
            eventQueue: eventQueue,
        });

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
                (player as any).energy = 0;

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

        describe("Turbo", () => {
            const INITIAL_ENERGY = 2;
            const INITIAL_HEALTH = 1;

            beforeEach(() => {
                player.spawn({
                    position: new Vector(42, 69),
                    initialHealth: INITIAL_HEALTH,
                    initialEnergy: INITIAL_ENERGY,
                    maxEnergy: 3,
                });

                // Simulate first frame where the player moves forward
                controller.pressKey(KeyCode.Up);
                player.update(0, gameContext);
                controller.releaseKey(KeyCode.Up);
            });

            it("Triggers on boost input when there is enough energy", () => {
                controller.pressKey(KeyCode.Action);
                player.update(0, gameContext);
                expect(player.getForward().getSize()).to.equal(
                    settings.PLAYER_TURBO_FORWARD_SPEED,
                );
                expect(player.getEnergy()).to.equal(INITIAL_ENERGY - 1);
            });

            it("Does not trigger when there's not enough energy", () => {
                (player as any).energy = 0;

                controller.pressKey(KeyCode.Action);
                player.update(0, gameContext);
                expect(player.getForward().getSize()).to.equal(
                    settings.PLAYER_FORWARD_SPEED,
                );
                expect(player.getEnergy()).to.equal(0);
            });

            it("Turbo is cancelled on player thrust", () => {
                controller.pressKey(KeyCode.Action);
                player.update(0, gameContext);
                expect(player.getForward().getSize()).to.equal(
                    settings.PLAYER_TURBO_FORWARD_SPEED,
                );

                controller.pressKey(KeyCode.Up);
                player.update(0, gameContext);
                expect(player.getForward().getSize()).to.equal(
                    settings.PLAYER_FORWARD_SPEED,
                );
            });
        });
    });
});
