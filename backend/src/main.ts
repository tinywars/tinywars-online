import { createServer, Server as HttpServer } from "http";
import { Server, ServerOptions } from "socket.io";
import { ClientEvents } from "./events/client-events";
import { ServerEvents } from "./events/server-events";
import { BACKEND_PORT, FRONTEND_PORT, HOST_IP } from "./settings";
import { ClientState } from "./types/client-state";
import { NetGameState } from "./types/game-state";

const games: Map<string, NetGameState> = new Map();

const httpServer: HttpServer = createServer();
const serverOptions: Partial<ServerOptions> = {
    cors: {
        origin: [`http://localhost:${FRONTEND_PORT}`], // this is IP and port of frontend server
    },
};
const io = new Server<ClientEvents, ServerEvents>(httpServer, serverOptions);

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

    socket.on("error", (e) => {
        console.log(`Error occured: ${e.name}: ${e.message}`);
    });

    /*socket.on("clientChanged", (clientState) => {
        let clientIndex = -1;
        state.clients.forEach((c, i) => {
            if (c.id === clientState.id) clientIndex = i;
        });

        if (clientIndex === -1) {
            console.log(`Player ${clientState.name} has connected`);
            state.clients.push(clientState);
        } else {
            console.log(
                `Player ${clientIndex} changed their name to ${clientState.name}`,
            );
            state.clients[clientIndex].name = clientState.name;
        }

        socket.emit("lobbyUpdated", state);
    });*/

    socket.on("lobbyRequested", (clientState: ClientState) => {
        const connectionCode = clientState.id + "";
        games.set(connectionCode, {
            hostCode: connectionCode,
            clients: [clientState],
        });
        socket.join(connectionCode); // now we can broadcast within that room

        socket.emit("lobbyCreated", connectionCode);
    });

    socket.on(
        "lobbyEntered",
        (connectionCode: string, clientState: ClientState) => {
            console.log("Client entered lobby");
            if (games.has(connectionCode)) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const lobby = games.get(connectionCode)!;
                if (
                    lobby.clients.find((cs) => cs === clientState) === undefined
                ) {
                    lobby.clients.push(clientState);
                    socket.join(connectionCode); // now we can broadcast within that room
                    io.to(connectionCode).emit("lobbyUpdated", lobby);
                } else {
                    socket.emit(
                        "lobbyError",
                        "You are already connected to this lobby.",
                    );
                }
            } else {
                socket.emit("lobbyError", "Lobby does not exist.");
            }
        },
    );

    socket.on("lobbyCommited", (clientState: ClientState) => {
        const connectionCode = clientState.id + "";

        // Broadcast to all peers in the lobby (room)
        io.to(connectionCode).emit("gameStarted", games.get(connectionCode)!);
    });
});

httpServer.listen(BACKEND_PORT);
console.log(`Server listening on ${HOST_IP}:${BACKEND_PORT}`);
