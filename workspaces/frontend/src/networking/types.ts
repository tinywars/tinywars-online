import { Socket } from "socket.io-client";
import type { ClientEvents } from "../../../backend/src/events/client-events";
import type { ServerEvents } from "../../../backend/src/events/server-events";

export type TinywarsSocket = Socket<ServerEvents, ClientEvents>;
