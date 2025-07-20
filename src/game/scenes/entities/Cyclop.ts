import { Game } from "../Game";
import { Entity } from "./Entity";

export class Cyclop extends Entity {
    target: Entity;
    isSlowedByTree: boolean = false;
    currentSpeed: number;
    slowTimeout?: ReturnType<typeof setTimeout>;
    cyclopSpeed: number;

    constructor(scene: Game, target: Entity, x?: number, y?: number) {
        const posX = x ? x : Phaser.Math.Between(100, scene.scale.width - 100);
        const posY = y ? y : Phaser.Math.Between(100, scene.scale.height - 100);
        super(scene, posX, posY, "cyclop");

        this.target = target;
        this.createEntityLifeBar();
        this.setCollideWorldBounds(true);

        this.cyclopSpeed = 50;
        this.currentSpeed = this.cyclopSpeed;

        scene.physics.add.overlap(
            scene.char,
            this,
            () => {
                if (!this.active) return;
                this.destroyEntityLifeBar();
                scene.tweens.add({
                    targets: this,
                    scale: 0,
                    alpha: 0,
                    duration: 100,
                    onComplete: () => {
                        this.destroy();
                    },
                });
                if (scene.plankCount > 0) {
                    scene.plankCount -= 1;
                }
                scene.gameText.setText(`Planks: ${scene.plankCount}`);
            },
            undefined,
            this
        );

        scene.physics.add.overlap(
            this,
            scene.trees,
            () => {
                if (this.isSlowedByTree) return;

                this.isSlowedByTree = true;
                this.currentSpeed = this.cyclopSpeed * 0.4;

                if (this.slowTimeout) {
                    clearTimeout(this.slowTimeout);
                }

                this.slowTimeout = setTimeout(() => {
                    this.currentSpeed = this.cyclopSpeed;
                    this.isSlowedByTree = false;
                }, 100);
            },
            undefined,
            this
        );
    }

    update() {
        const cyclopAngle = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            this.target.x,
            this.target.y
        );

        this.setVelocity(
            Math.cos(cyclopAngle) * this.currentSpeed,
            Math.sin(cyclopAngle) * this.currentSpeed
        );

        this.updateEntityLifeBar();
    }
}
