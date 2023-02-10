export function AreGamepadsSupported() : boolean {
    // Firefox is a bitch
    try {
        navigator.getGamepads()
        return true;
    } catch {
        return false;
    }
}

export function HasGamepadUsableMapping(pad: Gamepad | null): boolean {
    return pad?.mapping === "standard";
}

export function GetNthGamepad(index: number) : (Gamepad | null) {
    if (!AreGamepadsSupported())
        return null;
    
    const gamepad = navigator.getGamepads()[index];
    return HasGamepadUsableMapping(gamepad) ? gamepad : null;
}