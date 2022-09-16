import { Accessor, For, Match, Switch } from "solid-js";
import { NetGameInfo } from "../../backend/src/types/game-info";

export interface NetGameListProps {
    gameInfos: Accessor<NetGameInfo[]>;
    onJoinClick: (id: string) => void;
}

export function NetGameList(props: NetGameListProps) {
    return (
        <table class="netGameListTable">
            <thead>
                <tr>
                    <td>Game ID</td>
                    <td>Player count</td>
                    <td></td>
                </tr>
            </thead>
            <tbody>
                <For each={props.gameInfos()}>
                    {(info) => (
                        <tr>
                            <td>{info.id}</td>
                            <td>{info.numConnected} / 4</td>
                            <td>
                                <Switch>
                                    <Match when={info.numConnected < 4}>
                                        <button
                                            onClick={() =>
                                                props.onJoinClick(info.id)
                                            }
                                        >
                                            Join
                                        </button>
                                    </Match>
                                </Switch>
                            </td>
                        </tr>
                    )}
                </For>
            </tbody>
        </table>
    );
}
