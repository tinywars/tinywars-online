import { PlayerControls } from "../../game/player-settings";
import "./ControlsPrinter.css";

function FormatKey(key: string) : string
{
    if (key.startsWith("Key")) return key.substring(3);
    else if (key.startsWith("Numpad")) return "Num" + key.substring(6);
    return key;
}

interface ControlsPrinter
{
    playerIndex: number;
    controls: PlayerControls
}

export function ControlsPrinter(props: ControlsPrinter) {
    return (
        <div>
            Keyboard:
            <ul>
                <li>Thrust: {FormatKey(props.controls.forward.key)}/{FormatKey(props.controls.backward.key)}</li>
                <li>Rotate: {FormatKey(props.controls.steerLeft.key)}/{FormatKey(props.controls.steerRight.key)}</li>
                <li>Shoot: {FormatKey(props.controls.shoot.key)}</li>
                <li>Turbo: {FormatKey(props.controls.action.key)}</li>
            </ul>

            Gamepad:
            <ul>
                <li>Thrust: Triggers</li>
                <li>Rotate: Left stick / Dpad</li>
                <li>Shoot: X</li>
                <li>Turbo: A</li>
            </ul>
        </div>
    );
}