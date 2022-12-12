import { Accessor } from "solid-js";
import "./GameStatsDisplay.css";

interface GameStatsProps {
    hidden: Accessor<boolean>;
    simulationTime: Accessor<number>;
    latency: Accessor<number>;
}

export function GameStatsDisplay(props: GameStatsProps)
{
    return (
        <div id="GameStatsDisplay" classList={{
            hidden_elem: props.hidden(),
        }}>
            <div>Simul time: { props.simulationTime() } ms</div>
            <div>Latency: { props.latency() } ms</div>
        </div>
    )
}