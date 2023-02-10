import { GamepadAxis, GamepadButton } from "../controllers/physical-controller";
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
    isComputerControlled: boolean;
    controls: PlayerControls;
}

export const PLAYER1_DEFAULT_CONTROLS: PlayerControls = {
    forward: {
        code: KeyCode.Up,
        key: "KeyW",
        button: GamepadButton.RTrigger,
    },
    backward: {
        code: KeyCode.Down,
        key: "KeyS",
        button: GamepadButton.LTrigger,
    },
    steerLeft: {
        code: KeyCode.Left,
        key: "KeyA",
        button: GamepadButton.DpadLeft,
    },
    steerRight: {
        code: KeyCode.Right,
        key: "KeyD",
        button: GamepadButton.DpadRight,
    },
    shoot: {
        code: KeyCode.Shoot,
        key: "KeyR",
        button: GamepadButton.X,
    },
    action: {
        code: KeyCode.Action,
        key: "KeyT",
        button: GamepadButton.A,
    },
    steerAxis: GamepadAxis.LHorizontal,
};

export const PLAYER2_DEFAULT_CONTROLS: PlayerControls = {
    forward: {
        code: KeyCode.Up,
        key: "KeyI",
        button: GamepadButton.RTrigger,
    },
    backward: {
        code: KeyCode.Down,
        key: "KeyK",
        button: GamepadButton.LTrigger,
    },
    steerLeft: {
        code: KeyCode.Left,
        key: "KeyJ",
        button: GamepadButton.DpadLeft,
    },
    steerRight: {
        code: KeyCode.Right,
        key: "KeyL",
        button: GamepadButton.DpadRight,
    },
    shoot: {
        code: KeyCode.Shoot,
        key: "KeyP",
        button: GamepadButton.X,
    },
    action: {
        code: KeyCode.Action,
        key: "KeyO",
        button: GamepadButton.A,
    },
    steerAxis: GamepadAxis.LHorizontal,
};

export const PLAYER3_DEFAULT_CONTROLS: PlayerControls = {
    forward: {
        code: KeyCode.Up,
        key: "Numpad5",
        button: GamepadButton.RTrigger,
    },
    backward: {
        code: KeyCode.Down,
        key: "Numpad2",
        button: GamepadButton.LTrigger,
    },
    steerLeft: {
        code: KeyCode.Left,
        key: "Numpad1",
        button: GamepadButton.DpadLeft,
    },
    steerRight: {
        code: KeyCode.Right,
        key: "Numpad3",
        button: GamepadButton.DpadRight,
    },
    shoot: {
        code: KeyCode.Shoot,
        key: "Numpad9",
        button: GamepadButton.X,
    },
    action: {
        code: KeyCode.Action,
        key: "Numpad6",
        button: GamepadButton.A,
    },
    steerAxis: GamepadAxis.LHorizontal,
};

export const PLAYER4_DEFAULT_CONTROLS: PlayerControls = {
    forward: {
        code: KeyCode.Up,
        key: "KeyG",
        button: GamepadButton.RTrigger,
    },
    backward: {
        code: KeyCode.Down,
        key: "KeyB",
        button: GamepadButton.LTrigger,
    },
    steerLeft: {
        code: KeyCode.Left,
        key: "KeyV",
        button: GamepadButton.DpadLeft,
    },
    steerRight: {
        code: KeyCode.Right,
        key: "KeyN",
        button: GamepadButton.DpadRight,
    },
    shoot: {
        code: KeyCode.Shoot,
        key: "Space",
        button: GamepadButton.X,
    },
    action: {
        code: KeyCode.Action,
        key: "KeyH",
        button: GamepadButton.A,
    },
    steerAxis: GamepadAxis.LHorizontal,
};
