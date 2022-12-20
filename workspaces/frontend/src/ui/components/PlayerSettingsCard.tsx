import { Show } from "solid-js";
import icon_blue from "../../../assets/player-icons/blue.png";
import icon_green from "../../../assets/player-icons/green.png";
import icon_red from "../../../assets/player-icons/red.png";
import icon_yellow from "../../../assets/player-icons/yellow.png";
import { PlayerSettings } from "../../game/player-settings";
import { Checkbox } from "./Checkbox";
import "./PlayerSettingsCard.css";

const ICONS = [icon_red, icon_green, icon_blue, icon_yellow];

export interface PlayerSettingsCardProps {
    index: number;
    settings: PlayerSettings;
    setSettings: (settings: PlayerSettings) => void;
    enabled: boolean;
    netgame: boolean;
}

export function PlayerSettingsCard(props: PlayerSettingsCardProps) {
    return (
        <div class="player_settings vbox">
            <img src={ICONS[props.index]} />
            <div>
                <label for={`PlayerNameInput_${props.index}`}>
                    Player name:{" "}
                </label>
                <input
                    id={`PlayerNameInput_${props.index}`}
                    type="text"
                    value={props.settings.name}
                    onChange={(e) => {
                        props.settings.name = e.currentTarget.value;
                        props.setSettings(props.settings);
                    }}
                    disabled={!props.enabled}
                />
            </div>
            <Show when={props.enabled}>
                <div>
                    <label for={`InvertSteer_${props.index}`}>
                        Invert reverse steering:
                    </label>
                    <Checkbox
                        id={`InvertSteer_${props.index}`}
                        name="InvertSteer"
                        checked={props.settings.invertSteeringOnReverse}
                        onToggle={() => {
                            props.settings.invertSteeringOnReverse =
                                !props.settings.invertSteeringOnReverse;
                            props.setSettings(props.settings);
                        }}
                        disabled={!props.enabled}
                    />
                </div>
            </Show>
            <Show when={!props.netgame}>
                <div>
                    <label for={`ComputerControl_${props.index}`}>
                        AI controlled:
                    </label>
                    <Checkbox
                        id={`ComputerControl_${props.index}`}
                        name="ComputerControl"
                        checked={props.settings.isComputerControlled}
                        onToggle={() => {
                            props.settings.isComputerControlled =
                                !props.settings.isComputerControlled;
                            props.setSettings(props.settings);
                        }}
                        disabled={!props.enabled}
                    />
                </div>
            </Show>
        </div>
    );
}
