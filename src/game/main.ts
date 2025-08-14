import { Boot } from "./scenes/buchGame/Boot";
import { GameOver } from "./scenes/buchGame/GameOver";
import { Game as MainGame } from "./scenes/buchGame/Game";
import { AUTO, Game } from "phaser";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: "1600",
    height: "900",
    parent: "game-container",
    backgroundColor: "#ffffff",
    scene: [Boot, MainGame, GameOver],
    fps: {
        target: 60,
        forceSetTimeOut: true,
    },
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
    render: {
        powerPreference: "high-performance",
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
