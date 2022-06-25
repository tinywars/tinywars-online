export interface ClientState {
    // Unique identified of client on backend
    // It is okay if this changes each time client reloads the window
    id: string;
    // Display name of the player, this can be changed on whim, client is
    // identified by their id
    name: string;
}
