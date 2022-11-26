import { Match, Switch } from "solid-js";
import spritesheet from "../../../assets/spritesheet_v2.png";
import { PlayerSettings } from "../../game/player-settings";
import { Checkbox } from "./Checkbox";
import "./PlayerSettingsCard.css";

export interface PlayerSettingsCardProps {
    index: number;
    settings: PlayerSettings;
    setSettings: (settings: PlayerSettings) => void;
    enabled: boolean;
    netgame: boolean;
}

export function PlayerSettingsCard(props: PlayerSettingsCardProps) {
    return (
        <div class="player_settings">
            <div class="icon_wrap">
                {/* Cannot be scaled, we have to replace it with dedicated sprites */}
                <img src={spritesheet} />
            </div>

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

            <div>
                <Switch>
                    <Match when={!props.netgame}>
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
                    </Match>
                </Switch>
            </div>
        </div>
    );
}
