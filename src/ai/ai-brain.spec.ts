import { SimpleController } from "../controllers/simple-controller";
import { EventQueue } from "../events/event-queue";
import { GameContext } from "../game/game-context";
import { GameSettings } from "../game/game-settings";
import { KeyCode } from "../game/key-codes";
import { Player } from "../game/player";
import { getMockGameContext } from "../test/game-context";
import { getMockSettings } from "../test/game-settings";
import { Vector } from "../utility/vector";
import { AiBrain } from "./ai-brain";

describe("AiBrain", () => {
    let controller: SimpleController;
    let brain: AiBrain;
    let player: Player;
    let settings: GameSettings;
    let gameContext: GameContext;
    let eventQueue: EventQueue;

    // These must be the same as in gameSettings
    const PLAYER_ROTATION_SPEED = 200;
    const DT = 1 / 60;

    beforeEach(() => {
        controller = new SimpleController();
        eventQueue = new EventQueue();
        settings = getMockSettings();
        gameContext = getMockGameContext({
            numPlayers: 1,
            numProjectiles: 64,
            numObstacles: 8,
            numPowerups: 0,
            numEffects: 0,
            controllers: [controller],
            settings: settings,
            eventQueue: eventQueue,
        });

        gameContext.players.grow();
        player = gameContext.players.getItem(0);

        brain = new AiBrain(controller, player, gameContext);

        player.spawn({
            position: Vector.zero(),
            initialHealth: 1,
            initialEnergy: 0,
            maxEnergy: 1,
        });
    });

    [0, 45, 90, 135, 180, 225, 260, 305, 359].forEach((startAngle) => {
        [0, 45, 90, 135, 180, 225, 260, 305, 359].forEach((targetAngle) => {
            it(`Can rotate from ${startAngle} to ${targetAngle}`, () => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const anyPlayer = player as any;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const anyBrain = brain as any;
                (anyPlayer.rotation as number) = startAngle;
                (anyBrain.targetAngle as number) = targetAngle;

                while (!anyBrain.isTargetAngleAchieved(brain)) {
                    console.log(
                        `Player angle: ${
                            player.getCoords().angle
                        }, target: ${targetAngle}`,
                    );
                    controller.releaseKey(KeyCode.Left);
                    controller.releaseKey(KeyCode.Right);

                    anyBrain.rotateTowardsTarget();

                    const { steer } = controller.getThrottleAndSteer();
                    if (steer === 0) throw new Error("Not rotating");
                    anyPlayer.updateRotation(steer * PLAYER_ROTATION_SPEED, DT);
                }
            });
        });
    });
});
