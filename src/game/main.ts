import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { AUTO, Game } from "phaser";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: "1500",
    height: "1080",
    parent: "game-container",
    backgroundColor: "#028af8",
    scene: [Boot, MainGame, GameOver],
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            // debug: true,
        },
    },
    dom: {
        createContainer: true,
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
