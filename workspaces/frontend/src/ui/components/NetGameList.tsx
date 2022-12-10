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
        <div id="NetGameListTable" class="vbox">
            <div id="NetGameListThead" class="hbox">
                <div class="vbox space-around">
                    <div>Game ID</div>
                </div>
                <div class="vbox space-around">
                    <div>Player Count</div>
                </div>
                <div class="vbox space-around">
                    <button
                        onClick={() => props.onRefresh()}
                        id="RefreshButton"
                    >
                        Refresh
                    </button>
                </div>
            </div>
            <div id="NetGameListTbody" class="vbox">
                <For each={props.gameInfos()}>
                    {(info) => (
                        <div class="hbox">
                            <div>{info.id}</div>
                            <div>{info.numConnected} / 4</div>
                            <div>
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
                            </div>
                        </div>
                    )}
                </For>
            </div>
        </div>
    );
}
