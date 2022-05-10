import { Controller } from "./controller";

// Follows 'standard' mapping:
// https://w3c.github.io/gamepad/#dfn-standard-gamepad=
export enum GamepadButton {
    None = -1,
    A = 0,
    B = 1,
    X = 2,
    Y = 3,
    LBumper = 4,
    RBumper = 5,
    LTrigger = 6,
    RTrigger = 7,
    Select = 8,
    Start = 9,
    LStickDown = 10,
    RStickDown = 11,
    DpadUp = 12,
    DpadDown = 13,
    DpadLeft = 14,
    DpadRight = 15,
    Capture = 16,
}

export enum GamepadAxis {
    None = -1,
    LHorizontal = 0,
    LVertical = 1,
    RHorizontal = 0,
    RVertical = 0,
}

interface InputMapping {
    forciblyReleased: boolean;
    keyboardKeyName: string;
    gamepadButtonCode: GamepadButton;
}

export class PhysicalController implements Controller {
    private digitalMappings: Record<number, InputMapping> = {};
    private gamepadIndex = 0;
    private deadzone = 0;
    private analogMapping: Record<number, GamepadAxis> = {};

    constructor(private kbState: Record<string, boolean>) {}

    private isGamepadUsable(pad: Gamepad): boolean {
        return pad.mapping === "standard";
    }

    isKeyPressed(code: number): boolean {
        const gamepad = navigator.getGamepads()[this.gamepadIndex];
        const mapping = this.digitalMappings[code];
        let result = false;
        if (gamepad !== null && this.isGamepadUsable(gamepad)) {
            result =
                result || mapping.gamepadButtonCode != GamepadButton.None
                    ? gamepad.buttons[mapping.gamepadButtonCode].pressed
                    : false;
        }

        result = result || this.kbState[mapping.keyboardKeyName];
        if (mapping.forciblyReleased) {
            mapping.forciblyReleased = result;
            return false;
        }
        return result;
    }

    getAxisValue(code: number) {
        const gamepad = navigator.getGamepads()[this.gamepadIndex];
        const axisCode = this.analogMapping[code];
        if (
            gamepad === null ||
            !this.isGamepadUsable(gamepad) ||
            axisCode === GamepadAxis.None
        )
            return 0;

        if (Math.abs(gamepad.axes[axisCode]) < this.deadzone) return 0;
        return gamepad.axes[axisCode];
    }

    releaseKey(code: number) {
        this.digitalMappings[code].forciblyReleased = true;
    }

    bindDigitalInput(key: string, button: GamepadButton, code: number) {
        this.digitalMappings[code] = {
            forciblyReleased: false,
            keyboardKeyName: key,
            gamepadButtonCode: button,
        };
    }

    bindAnalogInput(axis: GamepadAxis, code: number) {
        this.analogMapping[code] = axis;
    }

    setGamepadIndex(index: number) {
        this.gamepadIndex = index;
    }

    setGamepadAxisDeadzone(deadzone: number) {
        this.deadzone = deadzone;
    }
}
