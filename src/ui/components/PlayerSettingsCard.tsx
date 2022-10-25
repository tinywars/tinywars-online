import { Match, Switch } from "solid-js";
import { PlayerSettings } from "../../game/player-settings";
import { Checkbox } from "./Checkbox";

export interface PlayerSettingsCardProps {
    index: number;
    settings: PlayerSettings;
    setSettings: (settings: PlayerSettings) => void;
    enabled: boolean;
    netgame: boolean;
}

export function PlayerSettingsCard(props: PlayerSettingsCardProps) {
    return (
        <div class="playerSettings">
            <input
                type="text"
                value={props.settings.name}
                onChange={(e) => {
                    props.settings.name = e.currentTarget.value;
                    props.setSettings(props.settings);
                }}
            />

            <label for={`InvertSteer_${props.index}`}>
                Invert steering on reverse
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
            />
            <Switch>
                <Match when={!props.netgame}>
                    <label for={`ComputerControl_${props.index}`}>
                        Computer controlled?
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
                    />
                </Match>
            </Switch>
        </div>
    );
}
