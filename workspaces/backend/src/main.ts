import assert from "assert";
import { createServer, Server as HttpServer } from "http";
import serveHandler from "serve-handler";
import { Server, ServerOptions } from "socket.io";
import { ClientEvents } from "./events/client-events";
import { ServerEvents } from "./events/server-events";
import {
    BACKEND_PORT,
    HOST_IP,
    IS_PRODUCTION,
    STATIC_FILES_PATH
} from "./settings";
import { ClientState } from "./types/client-state";
import { NetGameInfo } from "./types/game-info";
import { NetGameStateManager } from "./types/game-state";

const games: Map<string, NetGameStateManager> = new Map();
const clientsToGames: Map<string, string> = new Map(); // maps clientIds to games they're in

// serve static frontend files via the server only in production mode
function getServer() {
    return IS_PRODUCTION
        ? createServer((req, res) =>
            serveHandler(req, res, {
                public: STATIC_FILES_PATH,
                directoryListing: false,
                renderSingle: true,
            }),
        )
        : createServer();
}

const httpServer: HttpServer = getServer();

const serverOptions: Partial<ServerOptions> = {
    cors: {
        origin: IS_PRODUCTION ? false : true,
    },
};
const io = new Server<ClientEvents, ServerEvents>(httpServer, serverOptions);

function getGameByClient(id: string): NetGameStateManager {
    const gameId = clientsToGames.get(id);
    if (gameId === undefined) {
        throw Error(`Client (id: ${id}) is not connected to a game`);
    }

    const game = games.get(gameId);
    if (game === undefined) {
        throw Error(`Game (id: ${gameId}) does not exist`);
    }

    return game;
}

function handleClientLeavingGame(clientId: string) {
    const game = getGameByClient(clientId);
    game.markClientAsDisconnected(clientId);
    // If everybody dropped the game
    if (game.allClientsHaveDisconnected()) {
        console.log(
            `Deleting game with id ${game.state.id} (Reason: Everybody disconnected)`,
        );
        games.delete(game.state.id);
    }
}

io.on("connection", (socket) => {
    console.log(`User (id: ${socket.id}) connected`);

    socket.on("disconnect", () => {
        console.log(`User (id: ${socket.id}) disconnected`);
        try {
            handleClientLeavingGame(socket.id);
        } catch (e) {
            console.error(`\tError: ${(e as Error).message}`);
        }
    });

    socket.on("error", (e) => {
        console.error(`Error occured: ${e.name}: ${e.message}`);
    });

    socket.on("lobbyRequested", (gameId: string) => {
        if (games.has(gameId)) {
            console.error(
                `Game with id ${gameId} was requested, but it already exists`,
            );
            socket.emit("gameError", "Game with such code already exists.");
            return;
        }

        games.set(gameId, new NetGameStateManager(gameId));
        console.log(`Created game with id: ${gameId}`);
        socket.emit("lobbyCreated");
    });

    socket.on("lobbyEntered", (gameId: string, clientState: ClientState) => {
        try {
            const game = games.get(gameId);
            if (game === undefined)
                throw Error(`Game (id: ${gameId}) does not exist`);
            assert(game.state.id === gameId);

            if (game.isClientConnected(socket.id))
                throw Error(
                    `Client (id: ${socket.id}) already connected to this game (id: ${gameId})`,
                );

            console.log(
                `User (id: ${socket.id}, name: ${clientState.name}) entered lobby`,
            );

            game.addNewClient(clientState);
            clientsToGames.set(socket.id, game.state.id);

            socket.join(game.state.id); // join socket 'room' -> we can emit messages to whole room by io.to().emit();
            io.to(game.state.id).emit("lobbyUpdated", game.state); // emit message to whole room
        } catch (e) {
            console.error(
                `User (id: ${
                    clientState.id
                }) attempted to enter lobby, but failed (Reason: ${
                    (e as Error).message
                })`,
            );
            socket.emit("gameError", (e as Error).message);
        }
    });

    socket.on("lobbyPlayerUpdated", (clientState: ClientState) => {
        try {
            const game = getGameByClient(clientState.id);
            if (game === undefined)
                throw Error(
                    `Client (id: ${clientState.id}) is not connected to any game`,
                );
            const gameId = game.state.id;

            if (!game.isClientConnected(socket.id))
                throw Error(
                    `Client (id: ${socket.id}) not connected to this game (id: ${gameId})`,
                );

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const clientToUpdate = game.state.clients.find(
                (client) => client.id === clientState.id,
            )!;
            clientToUpdate.name = clientState.name;

            console.log(
                `User (id: ${socket.id}, changed their name to: ${clientState.name})`,
            );

            io.to(game.state.id).emit("lobbyUpdated", game.state);
        } catch (e) {
            console.error(
                `User (id: ${
                    clientState.id
                }) attempted to update their info, but failed (Reason: ${
                    (e as Error).message
                })`,
            );
        }
    });

    socket.on("lobbyPointLimitSet", (limit: number) => {
        try {
            const game = getGameByClient(socket.id);
            if (game === undefined)
                throw Error(`Client (id: ${socket.id} is not connected to any game`);

            game.setLimit(limit);

            console.log(`Game (id: ${game.state.id}) limit changed to ${limit}`);
            io.to(game.state.id).emit("lobbyUpdated", game.state);
        } catch (e) {
            console.error(`User (id ${socket.id}) attempted to set point limit, but failed (Reason: ${(e as Error).message})`);
        }
    });

    socket.on("lobbyCommitted", (gameId: string) => {
        const game = games.get(gameId);
        if (game === undefined) {
            console.log(`Tried to start non-existent game with id ${gameId}`);
            socket.emit("gameError", "Lobby does not exist.");
            return;
        }

        const seed = Date.now();
        game.startGame();
        console.log(
            `Started game with id ${gameId} and seed ${seed}. ${game.state.clients.length} clients are connected.`,
        );
        io.to(game.state.id).emit("gameStarted", game.state, seed);
    });

    socket.on("lobbyLeft", () => {
        console.log(`User (id: ${socket.id}) left the game`);
        try {
            handleClientLeavingGame(socket.id);
        } catch (e) {
            console.error(`\tError: ${(e as Error).message}`);
        }
    });

    socket.on("gameInputGathered", (inputs: boolean[], ack: () => void) => {
        ack(); // Socket.io acknowledgement

        try {
            const game = getGameByClient(socket.id);
            game.receiveClientInput(socket.id, inputs);
            if (game.areAllInputsCollected()) {
                io.to(game.state.id).emit(
                    "gameInputsCollected",
                    game.state.playerInputs,
                );
                game.resetInputs();
            }
        } catch (e) {
            const msg = (e as Error).message;
            console.error(
                `Inputs gathering failed for user with id ${socket.id} (Reason: ${msg})`,
            );
            socket.emit("gameError", msg);
        }
    });

    socket.on("gameListRequested", () => {
        console.log(
            `Game list requested. There are ${games.size} games in total.`,
        );

        const infos: NetGameInfo[] = [];
        games.forEach((netStateMgr) => {
            if (netStateMgr.hasGameStarted()) return;

            infos.push({
                id: netStateMgr.state.id,
                numConnected: netStateMgr.state.clients.length,
            });
        });

        socket.emit("gameListCollected", infos);
    });
});

httpServer.listen(BACKEND_PORT, () => {
    console.log(`Server listening on http://${HOST_IP}:${BACKEND_PORT}`);
    IS_PRODUCTION &&
        console.log(`Serving static frontend from ${STATIC_FILES_PATH}`);
});
