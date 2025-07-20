import { Game } from "../Game";
import { Entity } from "./Entity";
import { Sword } from "./Sword";

export class Character extends Entity {
    private cutTime = 0;
    private rangeCircle: Phaser.GameObjects.Graphics;
    private nearestTreeLine: Phaser.Geom.Line | null = null;
    isRangeVisible = false;
    cuttingRange: number;

    constructor(scene: Game, x: number, y: number, texture: "character") {
        super(scene, x, y, texture);

        this.maxLife = 3;
        this.life = this.maxLife;
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

    throwSword() {
        const sword = new Sword(this.scene, this.x, this.y, this);
        // if (this.time.now < this.nextSwordTime) return;
        // if (!this.swords) {
        //     this.swords = this.physics.add.group();
        // }
        // const sword = this.physics.add
        //     .sprite(this.character.x, this.character.y, "sword")
        //     .setScale(2)
        //     .setDepth(0);
        // this.swords.add(sword);
        // this.physics.add.collider(sword, this.trees, (_: any, tree: any) => {
        //     tree.setRotation(Phaser.Math.DegToRad(25));
        //     this.tweens.add({
        //         targets: tree,
        //         rotation: 0,
        //         duration: 100,
        //         ease: "Sine.easeInOut",
        //     });
        //     tree.setScale(tree.scale * 0.8);
        //     if (tree.scale <= 1) {
        //         tree.destroy();
        //         this.plankCount++;
        //         this.gameText.setText(`Planks: ${this.plankCount}`);
        //     }
        //     sword.destroy();
        // });
        // if (this.cyclops) {
        //     this.cyclops
        //         .getChildren()
        //         .forEach((cyclopObj: Phaser.GameObjects.GameObject) => {
        //             const cyclop = cyclopObj as CyclopWithLife;
        //             this.physics.add.collider(
        //                 sword,
        //                 cyclop,
        //                 (_: any, cyclopHit: CyclopWithLife) => {
        //                     if (!cyclopHit.active) return;
        //                     if (typeof cyclopHit.cyclopLife === "undefined") {
        //                         cyclopHit.cyclopLife = 3;
        //                     }
        //                     cyclopHit.cyclopLife--;
        //                     cyclopHit.setScale(3.5, 2);
        //                     cyclopHit.setTint(0xff0000);
        //                     this.tweens.add({
        //                         targets: cyclopHit,
        //                         scale: 2,
        //                         tint: 0xffffff,
        //                         duration: 50,
        //                         ease: "Sine.easeInOut",
        //                     });
        //                     this.updateCyclopLifeBar(cyclopHit);
        //                     sword.destroy();
        //                     if (cyclopHit.cyclopLife <= 0) {
        //                         this.tweens.add({
        //                             targets: cyclopHit,
        //                             alpha: 0,
        //                             duration: 100,
        //                             onComplete: () => {
        //                                 this.destroyCyclopLifeBar(cyclopHit);
        //                                 cyclopHit.destroy();
        //                             },
        //                         });
        //                     }
        //                 }
        //             );
        //         });
        // }
        // const angle = Phaser.Math.Angle.Between(
        //     this.character.x,
        //     this.character.y,
        //     targetX,
        //     targetY
        // );
        // sword.rotation = angle + Math.PI / 2;
        // this.physics.velocityFromRotation(
        //     angle,
        //     this.swordSpeed,
        //     sword.body?.velocity
        // );
        // this.nextSwordTime = this.time.now + this.swordCooldown;
        // this.time.delayedCall(2000, () => {
        //     if (sword && sword.active) {
        //         this.tweens.add({
        //             targets: sword,
        //             scale: 0,
        //             duration: 100,
        //             ease: "Sine.easeInOut",
        //             onComplete: () => {
        //                 sword.destroy();
        //             },
        //         });
        //     }
        // });
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
