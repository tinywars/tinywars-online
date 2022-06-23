import { createServer, Server as HttpServer } from "http";
import { Server, ServerOptions } from "socket.io";
import { ClientEvents, LobbyState, ServerEvents } from "./events";

const state: LobbyState = {
    clients: [],
};

const httpServer: HttpServer = createServer();
const serverOptions: Partial<ServerOptions> = {
    cors: {
        origin: ["http://localhost:3000"], // this is IP and port of frontend server
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

    socket.on("clientChanged", (clientState) => {
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
    });
});

const PORT = 10666;
const HOST = "0.0.0.0";

httpServer.listen(PORT);
console.log(`Server listening on ${HOST}:${PORT}`);
