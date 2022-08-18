import { KeyCode } from "../game/key-codes";
import { PlayerSettings } from "../game/player-settings";
import { PhysicalController } from "./physical-controller";

export class ControllerFactory {
    static createPhysicalController(
        index: number,
        playerSettings: PlayerSettings,
        keyboardState: Record<string, boolean>,
    ): PhysicalController {
        const controls = playerSettings.controls;
        const result = new PhysicalController(keyboardState);

        Object.values(controls).forEach((binding) => {
            if (
                binding.key === undefined ||
                binding.button === undefined ||
                binding.code === undefined
            )
                return;
            result.bindDigitalInput(binding.key, binding.button, binding.code);
        });

        result.bindAnalogInput(controls.steerAxis, KeyCode.Rotation);
        result.setGamepadIndex(index);
        result.setGamepadAxisDeadzone(0.25);
        result.setInvertSteeringOnReverse(
            playerSettings.invertSteeringOnReverse,
        );
        return result;
    }
}
