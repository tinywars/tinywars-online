import { Accessor, For, onMount } from "solid-js";
import { NetGameInfo } from "../../../backend/src/types/game-info";

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
        <table class="netGameListTable">
            <thead>
                <tr>
                    <td>Game ID</td>
                    <td>Player count</td>
                    <td>
                        <button onClick={() => props.onRefresh()}>
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
                                <span
                                    classList={{
                                        disabled: info.numConnected >= 4,
                                    }}
                                >
                                    <button
                                        onclick={() => {
                                            props.onJoinClick(info.id);
                                        }}
                                        class="menu_button"
                                    >
                                        Join
                                    </button>
                                </span>
                            </td>
                        </tr>
                    )}
                </For>
            </tbody>
        </table>
    );
}
