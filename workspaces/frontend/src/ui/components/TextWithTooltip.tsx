import { JSX } from "solid-js/jsx-runtime";
import "./TextWithTooltip.css";

interface TextWithTooltipProps
{
    text: string;
    tooltip: JSX.Element;
}

export function TextWithTooltip(
    props: TextWithTooltipProps,
) {
    return (<u class="tooltipwrapper">{props.text} <div class="tooltiptarget">{props.tooltip}</div></u>);
}