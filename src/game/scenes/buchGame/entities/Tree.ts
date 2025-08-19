import { Game } from "../Game";
import { Entity } from "./Entity";
import Phaser from "phaser";

export class Tree extends Entity {
    private scaleHeight: number;
    private windMovement: Phaser.Tweens.Tween;
    private inCameraView: boolean = true;

    constructor(scene: Game, x: number, y: number) {
        super(scene, x, y, "tree");

        this.maxLife = 5;
        this.life = this.maxLife;
        this.scaleHeight = Phaser.Math.Between(3.75, 4);

        this.setScale(3, this.scaleHeight);
        this.setDepth(y / 10);

        this.setOrigin(0.5, 1);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setSize(this.width * 0.4, this.height * 0.6);
        this.setOffset(this.width * 0.3, this.height * 0.2);

        const duration = Phaser.Math.Between(1500, 2500);
        const delay = Phaser.Math.Between(0, 500);

        this.windMovement = scene.tweens.add({
            targets: [this],
            rotation: Phaser.Math.DegToRad(2),
            duration: duration, // Random duration between 1.5-2.5s
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
            delay: delay, // Random delay for each tree
        });
    }

    takeDamage(damage: number) {
        this.life -= damage;
        if (this.life <= 0) {
            this.windMovement.stop();
            this.destroy();
        } else {
            // Temporarily stop wind movement
            this.windMovement.pause();

            this.setRotation(Phaser.Math.DegToRad(10));
            this.scene.tweens.add({
                targets: [this],
                rotation: Phaser.Math.DegToRad(-10),
                duration: 100,
                ease: "Sine.easeInOut",
                onComplete: () => {
                    this.scene.tweens.add({
                        targets: [this],
                        rotation: Phaser.Math.DegToRad(0),
                        duration: 100,
                        ease: "Sine.easeInOut",
                        onComplete: () => {
                            this.windMovement.resume();
                        },
                    });
                },
            });

            if (this.life === 0) {
                this.windMovement.stop();
                this.destroy();
            }
        }
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        // Détecter si l'arbre est dans la vue caméra (avec marge pour éviter du flicker)
        const cam = this.scene.cameras.main;
        const view = cam.worldView;
        const margin = 100;
        const expanded = new Phaser.Geom.Rectangle(
            view.x - margin,
            view.y - margin,
            view.width + margin * 2,
            view.height + margin * 2
        );
        const bounds = this.getBounds();
        const nowInView = Phaser.Geom.Rectangle.Overlaps(expanded, bounds);

        if (nowInView !== this.inCameraView) {
            this.inCameraView = nowInView;

            if (nowInView) {
                this.setVisible(true);
                if (this.body)
                    (this.body as Phaser.Physics.Arcade.Body).enable = true;
                if (this.windMovement && this.windMovement.isPaused()) {
                    this.windMovement.resume();
                }
            } else {
                if (this.windMovement && this.windMovement.isPlaying()) {
                    this.windMovement.pause();
                }
                this.setVisible(false);
                if (this.body)
                    (this.body as Phaser.Physics.Arcade.Body).enable = false;
            }
        }
    }
}
