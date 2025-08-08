import { Game } from "../Game";
import { Entity } from "./Entity";

export class Tree extends Entity {
    constructor(scene: Game, x: number, y: number) {
        super(scene, x, y, "tree");

        this.maxLife = 5;
        this.life = this.maxLife;

        this.setScale(3);
        this.setDepth(10);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setSize(this.width * 0.4, this.height * 0.6);
        this.setOffset(this.width * 0.3, this.height * 0.2);
    }

    takeDamage(damage: number) {
        this.life -= damage;
        if (this.life <= 0) {
            this.destroy();
        } else {
            this.setRotation(Phaser.Math.DegToRad(25));
            this.scene.tweens.add({
                targets: this,
                rotation: 0,
                duration: 100,
                ease: "Sine.easeInOut",
            });
            this.setScale(this.scale * 0.8);

            if (this.life === 0) {
                this.destroy();
            }
        }
    }
}
