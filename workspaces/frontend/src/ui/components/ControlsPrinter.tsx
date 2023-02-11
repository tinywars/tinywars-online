import { PlayerControls } from "../../game/player-settings";
import "./ControlsPrinter.css";

function formatKey(key: string): string {
    if (key.startsWith("Key")) return key.substring(3);
    else if (key.startsWith("Numpad")) return "Num" + key.substring(6);
    else if (key.startsWith("Arrow")) return key.substring(5);
    return key;
}

interface ControlsPrinterProps {
    controls: PlayerControls;
}

export function ControlsPrinter(props: ControlsPrinterProps) {
    return (
        <div>
            Keyboard:
            <ul>
                <li>
                    Thrust: {formatKey(props.controls.forward.key)} /{" "}
                    {formatKey(props.controls.backward.key)}
                </li>
                <li>
                    Rotate: {formatKey(props.controls.steerLeft.key)} /{" "}
                    {formatKey(props.controls.steerRight.key)}
                </li>
                <li>Shoot: {formatKey(props.controls.shoot.key)}</li>
                <li>Turbo: {formatKey(props.controls.action.key)}</li>
            </ul>
            Gamepad:
            <ul>
                <li>Thrust: Triggers</li>
                <li>Rotate: Left stick / D-pad</li>
                <li>Shoot: X</li>
                <li>Turbo: A</li>
            </ul>
        </div>
    );
}
