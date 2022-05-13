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

export class PhysicalController extends Controller {
    private digitalMappings: Record<number, InputMapping> = {};
    private gamepadIndex = 0;
    private deadzone = 0;
    private analogMapping: Record<number, GamepadAxis> = {};
    private invertSteeringOnReverse = false;

    constructor(private kbState: Record<string, boolean>) {
        super();
    }

    override getThrottleAndSteer(): { throttle: number; steer: number } {
        const throttleAndSteer = super.getThrottleAndSteer();
        if (this.invertSteeringOnReverse && throttleAndSteer.throttle < 0)
            throttleAndSteer.steer *= -1;
        return throttleAndSteer;
    }

    setInvertSteeringOnReverse(flag: boolean) {
        this.invertSteeringOnReverse = flag;
    }

    setGamepadIndex(index: number) {
        this.gamepadIndex = index;
    }

    setGamepadAxisDeadzone(deadzone: number) {
        this.deadzone = deadzone;
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

    protected isInputPressed(code: number): boolean {
        const mapping = this.digitalMappings[code];
        return (
            this.isButtonPressed(mapping) || this.isKeyboardKeyPressed(mapping)
        );
    }

    protected getAxisValue(code: number) {
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

    private isGamepadUsable(pad: Gamepad | null): boolean {
        return pad?.mapping === "standard";
    }

    private isKeyboardKeyPressed(mapping: InputMapping) {
        return this.kbState[mapping.keyboardKeyName];
    }

    private isButtonPressed(mapping: InputMapping) {
        const gamepad = navigator.getGamepads()[this.gamepadIndex];
        return (
            (this.isGamepadUsable(gamepad) &&
                gamepad?.buttons[mapping.gamepadButtonCode].pressed) ??
            false
        );
    }
}
