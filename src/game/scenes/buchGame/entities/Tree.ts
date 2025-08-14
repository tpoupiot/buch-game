import { Game } from "../Game";
import { Entity } from "./Entity";

export class Tree extends Entity {
    private shadow: Phaser.GameObjects.Sprite;
    private scaleHeight: number;

    constructor(scene: Game, x: number, y: number) {
        super(scene, x, y, "tree");

        this.maxLife = 5;
        this.life = this.maxLife;
        this.scaleHeight = Phaser.Math.Between(3.75, 4);

        this.shadow = scene.add.sprite(x + 25, y, "tree");
        this.shadow.setScale(3, this.scaleHeight);
        this.shadow.setTint(0x000000);
        this.shadow.setAlpha(0.3);
        this.shadow.setAngle(45);
        this.shadow.setDepth(y / 10 - 1);
        this.shadow.setSize(this.shadow.width * 0.4, this.shadow.height * 0.6);

        this.setScale(3, this.scaleHeight);
        this.setDepth(y / 10);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setSize(this.width * 0.4, this.height * 0.6);
        this.setOffset(this.width * 0.3, this.height * 0.2);
    }

    takeDamage(damage: number) {
        this.life -= damage;
        if (this.life <= 0) {
            this.shadow.destroy();
            this.destroy();
        } else {
            this.setRotation(Phaser.Math.DegToRad(25));
            this.scene.tweens.add({
                targets: [this, this.shadow],
                rotation: 0,
                duration: 100,
                ease: "Sine.easeInOut",
            });
            this.setScale(this.scale * 0.8);
            this.shadow.setScale(this.shadow.scale * 0.8);

            if (this.life === 0) {
                this.shadow.destroy();
                this.destroy();
            }
        }
    }
}
