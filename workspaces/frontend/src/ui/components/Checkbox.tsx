import "./Checkbox.css";

interface CheckboxProps {
    id: string;
    checked: boolean;
    name: string;
    onToggle: () => void;
    disabled?: boolean;
}

export function Checkbox(props: CheckboxProps) {
    return (
        <input
            class="checkbox"
            id={props.id}
            type="checkbox"
            name={props.name}
            checked={props.checked}
            onClick={() => props.onToggle()}
            disabled={props.disabled ?? false}
        />
    );
}
