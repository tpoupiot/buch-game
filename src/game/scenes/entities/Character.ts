import { Game } from "../Game";
import { Entity } from "./Entity";
import { Sword } from "./Sword";

export class Character extends Entity {
    private cutTime = 0;
    private rangeCircle: Phaser.GameObjects.Graphics;
    private nearestTreeLine: Phaser.Geom.Line | null = null;
    isRangeVisible = false;
    cuttingRange: number;

    private throwTime = 0;
    private delayThrow = 500;

    constructor(scene: Game, x: number, y: number, texture: "character") {
        super(scene, x, y, texture);

        this.damage = 1;
        this.delayAttack = 500;
        this.speed = 250;
        this.currentSpeed = this.speed;
        this.cuttingRange = 100;

        this.setCollideWorldBounds(true);
        scene.physics.add.collider(this, scene.trees);

        this.rangeCircle = scene.add.graphics();
        this.nearestTreeLine = null;
    }

    getHit() {
        this.setScale(4, 2);
        this.setTint(0xff0000);
        this.scene.tweens.add({
            targets: this,
            scale: 2,
            tint: 0xffffff,
            duration: 100,
            ease: "Sine.easeInOut",
        });
    }

    canCut() {
        return this.scene.time.now >= this.cutTime + this.delayAttack;
    }

    cut() {
        this.setScale(2.5, 2);
        this.scene.tweens.add({
            targets: this,
            scale: 2,
            duration: 100,
            ease: "Sine.easeInOut",
        });
        this.cutTime = this.scene.time.now;
    }

    private drawRangeCircle() {
        this.rangeCircle.clear();
        this.nearestTreeLine = null;
        this.rangeCircle.lineStyle(2, 0xffffff, this.isRangeVisible ? 0.8 : 0);
        this.rangeCircle.strokeCircle(this.x, this.y, this.cuttingRange);

        const nearestTree = this.scene.findNearestTree();
        if (nearestTree) {
            const dx = nearestTree.x - this.x;
            const dy = nearestTree.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= this.cuttingRange) {
                this.nearestTreeLine = new Phaser.Geom.Line(
                    this.x,
                    this.y,
                    nearestTree.x,
                    nearestTree.y
                );
                this.rangeCircle.lineStyle(2, 0xff0000, 1);
                this.rangeCircle.strokeLineShape(this.nearestTreeLine);
            }
        }
    }

    canThrow() {
        return this.scene.time.now >= this.throwTime + this.delayThrow;
    }

    handleThrowAction() {
        if (this.canThrow()) {
            const sword = new Sword(this.scene, this.x, this.y, this);
            this.throwTime = this.scene.time.now;
        }
    }

    override destroy() {
        return null;
    }

    update() {
        super.update();
        this.drawRangeCircle();

        if (this.isRangeVisible) {
            this.rangeCircle.setVisible(true);
        } else {
            this.rangeCircle.setVisible(false);
        }
    }
}
