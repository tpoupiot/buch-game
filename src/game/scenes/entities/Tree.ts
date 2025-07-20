import { Game } from "../Game";
import { Entity } from "./Entity";

export class Tree extends Entity {
    constructor(scene: Game, x: number, y: number) {
        super(scene, x, y, "tree");
        this.setScale(3);
        this.setDepth(10);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setSize(this.width * 0.4, this.height * 0.6);
        this.setOffset(this.width * 0.3, this.height * 0.2);
    }
}
