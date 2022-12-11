import { Server, Socket } from "socket.io";
import { ClientEvents } from "../events/client-events";
import { ServerEvents } from "../events/server-events";

export type TinywarsServer = Server<ServerEvents, ClientEvents>;
export type TinywarsSocket = Socket<ServerEvents, ClientEvents>;
