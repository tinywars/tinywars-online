import { expect } from "chai";
import { EventQueue } from "../events/event-queue";
import { KeyCode } from "../game/key-codes";
import { Player } from "../game/player";
import { AnimationEngine, AnimationFrame } from "../utility/animation";
import { Vector } from "../utility/vector";
import { AiBrain } from "./ai-brain";
import { AiPoweredController } from "./ai-controller";

const animations = {
    idle: [new AnimationFrame(0, 0, 0, 0)],
};

describe("AiBrain", () => {
    let controller: AiPoweredController;
    let brain: AiBrain;
    let player: Player;

    // These must be the same as in gameSettings
    const PLAYER_ROTATION_SPEED = 250;
    const DT = 1 / 60;

    beforeEach(() => {
        controller = new AiPoweredController();
        brain = new AiBrain(controller, 0);
        player = new Player(
            0,
            controller,
            new AnimationEngine(animations, 1),
            new EventQueue(),
        );

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
                const anyPlayer = player as any;
                const anyBrain = brain as any;
                (anyPlayer.rotation as number) = startAngle;
                (anyBrain.targetAngle as number) = targetAngle;

                while (!anyBrain.isTargetAngleAchieved(player)) {
                    //console.log("Player angle: " + player.getCoords().angle);
                    controller.releaseKey(KeyCode.Left);
                    controller.releaseKey(KeyCode.Right);

                    anyBrain.rotateTowardsTarget(player);

                    if (controller.isKeyPressed(KeyCode.Left)) {
                        anyPlayer.updateRotation(-PLAYER_ROTATION_SPEED, DT);
                    } else if (controller.isKeyPressed(KeyCode.Right)) {
                        anyPlayer.updateRotation(PLAYER_ROTATION_SPEED, DT);
                    } else {
                        throw new Error("Not rotating");
                    }
                }
            });
        });
    });
});
