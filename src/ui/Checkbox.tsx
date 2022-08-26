import { Match, Switch } from "solid-js";

interface CheckboxProps {
    id: string;
    checked: boolean;
    name: string;
    onToggle: () => void;
}

export function Checkbox(props: CheckboxProps) {
    return (
        <Switch>
            <Match when={props.checked}>
                <input
                    id={props.id}
                    type="checkbox"
                    name={props.name}
                    checked
                    onClick={() => props.onToggle()}
                />
            </Match>
            <Match when={!props.checked}>
                <input
                    id={props.id}
                    type="checkbox"
                    name={props.name}
                    onClick={() => props.onToggle()}
                />
            </Match>
        </Switch>
    );
}
