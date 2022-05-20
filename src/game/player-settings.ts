import { GamepadAxis } from "../utility/physical-controller";
import { GamepadButton } from "../utility/physical-controller";
import { KeyCode } from "./key-codes";

export interface PlayerInputBinding {
    code: KeyCode;
    key: string;
    button: GamepadButton;
}

export interface PlayerControls {
    forward: PlayerInputBinding;
    backward: PlayerInputBinding;
    steerLeft: PlayerInputBinding;
    steerRight: PlayerInputBinding;
    shoot: PlayerInputBinding;
    action: PlayerInputBinding;
    steerAxis: GamepadAxis;
}

export interface PlayerSettings {
    name: string;
    invertSteeringOnReverse: boolean;
    controls: PlayerControls;
}
