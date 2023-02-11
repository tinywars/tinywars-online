function hasGamepadUsableMapping(pad: Gamepad | null): boolean {
    return pad?.mapping === "standard";
}

export function getNthGamepad(index: number) : (Gamepad | null) {
    const gamepad = navigator.getGamepads()[index];
    return hasGamepadUsableMapping(gamepad) ? gamepad : null;
}