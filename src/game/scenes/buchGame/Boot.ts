import { Scene } from "phaser";

export class Boot extends Scene {
    constructor() {
        super("Boot");
    }

    preload() {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image("background", "assets/bg.png");

        this.load.image("character", "assets/char.png");
        this.load.image("character-moving1", "assets/char-m-1.png");
        this.load.image("character-moving2", "assets/char-m-2.png");

        this.load.image("cyclop", "assets/cyclop.png");
        this.load.image("cyclop-moving1", "assets/cyclop-m-1.png");
        this.load.image("cyclop-moving2", "assets/cyclop-m-2.png");

        this.load.image("tree", "assets/tree.png");
        this.load.image("star", "assets/star.png");
        this.load.image("sword", "assets/sword.png");

        this.load.image("grass", "assets/tile_0000.png");
        this.load.image("fern", "assets/tile_0001.png");
        this.load.image("flower", "assets/tile_0002.png");

        this.load.image("heart", "assets/heart.png");
    }

    create() {
        this.scene.start("Game");
    }
}
