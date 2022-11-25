import { Accessor, For, onMount } from "solid-js";
import { NetGameInfo } from "../../../backend/src/types/game-info";
import "./NetGameList.css";

export interface NetGameListProps {
    gameInfos: Accessor<NetGameInfo[]>;
    onJoinClick: (id: string) => void;
    onRefresh: () => void;
}

export function NetGameList(props: NetGameListProps) {
    onMount(() => {
        props.onRefresh();
    });

    return (
        <table id="NetGameListTable">
            <thead>
                <tr>
                    <td>Game ID</td>
                    <td>Player count</td>
                    <td>
                        <button
                            onClick={() => props.onRefresh()}
                            id="RefreshButton"
                        >
                            Refresh
                        </button>
                    </td>
                </tr>
            </thead>
            <tbody>
                <For each={props.gameInfos()}>
                    {(info) => (
                        <tr>
                            <td>{info.id}</td>
                            <td>{info.numConnected} / 4</td>
                            <td>
                                <button
                                    onclick={() => {
                                        props.onJoinClick(info.id);
                                    }}
                                    classList={{
                                        disabled_button: info.numConnected >= 4,
                                    }}
                                    class="join_button"
                                >
                                    Join
                                </button>
                            </td>
                        </tr>
                    )}
                </For>
            </tbody>
        </table>
    );
}
