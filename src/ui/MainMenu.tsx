import { Component } from "solid-js";
import { LocalGameLobby } from "./LocalGameLobby";

export const MainMenu: Component = () => {
    console.log("Starting app");
    return <LocalGameLobby />;
};
