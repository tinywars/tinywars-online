import { createServer, Server as HttpServer } from "http";
import { Server, ServerOptions } from "socket.io";
import { ClientEvents } from "./events/client-events";
import { ServerEvents } from "./events/server-events";
import { BACKEND_PORT, HOST_IP } from "./settings";
import { ClientState } from "./types/client-state";
import { NetGameState } from "./types/game-state";

const games: Map<string, NetGameState> = new Map();
const clientsToGames: Map<string, string> = new Map(); // maps clientIds to games they're in

const httpServer: HttpServer = createServer();
const serverOptions: Partial<ServerOptions> = {
    cors: {
        origin: true, // allow all origins for now
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

    socket.on("lobbyRequested", (gameCode: string) => {
        if (games.has(gameCode)) {
            socket.emit("gameError", "Game with such code already exists.");
            return;
        }

        games.set(gameCode, {
            clients: [],
            collectedInputCount: 0,
            playerInputs: new Array(4),
        });

        socket.emit("lobbyCreated");
    });

    socket.on("lobbyEntered", (gameCode: string, clientState: ClientState) => {
        const game = games.get(gameCode);
        if (game === undefined) {
            socket.emit("gameError", "Lobby does not exist.");
            return;
        }

        if (game.clients.find((cs) => cs === clientState) !== undefined) {
            socket.emit(
                "gameError",
                "You are already connected to this lobby.",
            );
            return;
        }

        console.log(
            `Client ${clientState.id}@${clientState.name} entered lobby`,
        );

        game.clients.push(clientState);
        clientsToGames.set(clientState.id, gameCode);

        socket.join(gameCode); // join socket 'room' -> we can emit messages to whole room
        io.to(gameCode).emit("lobbyUpdated", game); // emit message to whole room
    });

    socket.on("lobbyCommited", (gameCode: string) => {
        const game = games.get(gameCode);
        if (game === undefined) {
            socket.emit("gameError", "Lobby does not exist.");
            return;
        }

        io.to(gameCode).emit("gameStarted", gameCode, game);
    });

    socket.on("gameInputGathered", (clientId: string, inputs: boolean[]) => {
        const gameId = clientsToGames.get(clientId);
        if (gameId === undefined) {
            socket.emit("gameError", "You are not connected in any game.");
            return;
        }

        const game = games.get(gameId);
        if (game === undefined) {
            socket.emit("gameError", "Game no longer exists.");
            return;
        }

        //console.log(`Got input from client ${clientId} for game ${gameId}`);

        game.clients.forEach((client, index) => {
            if (client.id !== clientId) return;
            game.playerInputs[index] = inputs;
            game.collectedInputCount++;
        });

        if (game.collectedInputCount === game.clients.length) {
            /*console.log(
                "All inputs for this frame were received, sending then back",
            );*/
            io.to(gameId).emit("gameInputsCollected", game.playerInputs);
            game.collectedInputCount = 0;
        }
    });
});

httpServer.listen(BACKEND_PORT);
console.log(`Server listening on ${HOST_IP}:${BACKEND_PORT}`);
