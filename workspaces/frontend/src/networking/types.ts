import { Socket } from "socket.io-client";
import { ClientEvents } from "../../backend/src/events/client-events";
import { ServerEvents } from "../../backend/src/events/server-events";

export type TinywarsSocket = Socket<ServerEvents, ClientEvents>;
