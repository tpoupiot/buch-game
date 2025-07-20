import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { Cyclop } from "./entities/Cyclop";
import { Character } from "./entities/Character";
import { PlayerControls } from "./utils/PlayerControls";
import { Tree } from "./entities/Tree";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    character: Phaser.Physics.Arcade.Sprite;
    trees: Phaser.Physics.Arcade.Group;
    char: Character;
    playerControls: PlayerControls;

    moveSpeed: number = 250;
    delayAction: number = 500;

    moveSpeedDash: number = 800;
    delayActionDash: number = 5000;
    nextActionDashTime: number = 0;

    speedIncreased: boolean = false;
    rangeIncreased: boolean = false;
    delayIncreased: boolean = false;

    cyclops: Phaser.Physics.Arcade.Group;

    fps: number = 60;
    distanceLines: Phaser.GameObjects.Graphics;
    plankCount: number = 0;

    swords: Phaser.Physics.Arcade.Group | null = null;
    sword: Phaser.Physics.Arcade.Sprite | null = null;
    swordSpeed: number = 400;
    swordCooldown: number = 500;
    nextSwordTime: number = 0;

    cyclopSpawnTimer: Phaser.Time.TimerEvent | null = null;

    constructor() {
        super("Game");
    }

    create() {
        this.physics.world.setFPS(this.fps);

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, "background");
        this.background.setAlpha(0.5);

        this.background.setScrollFactor(0);
        this.background.setDepth(-1);
        this.background.setScale(10);
        this.background.setInteractive();

        this.distanceLines = this.add.graphics();
        // this.rangeCircle = this.add.graphics();

        this.swords = this.physics.add.group();

        this.trees = this.physics.add.group({
            immovable: true,
        });

        this.char = new Character(this, 100, 100, "character");
        this.playerControls = new PlayerControls(this, this.char);

        this.initCounter();
        this.initTrees();
        this.initCyclops();
        this.createStatIndicator();

        this.cyclopSpawnTimer = this.time.addEvent({
            delay: 2000,
            callback: () => {
                this.cyclops.add(new Cyclop(this, this.char));
            },
            callbackScope: this,
            loop: true,
        });

        EventBus.emit("current-scene-ready", this);
    }

    private initCyclops() {
        this.cyclops = this.physics.add.group();
        const cyclop = new Cyclop(this, this.char);
        this.cyclops.add(cyclop);
    }

    handleCutAction() {
        const nearestTree = this.findNearestTree();
        if (nearestTree && this.char.canCut()) {
            this.char.cut();

            nearestTree.setRotation(Phaser.Math.DegToRad(25));
            this.tweens.add({
                targets: nearestTree,
                rotation: 0,
                duration: 100,
                ease: "Sine.easeInOut",
            });
            nearestTree.setScale(nearestTree.scale * 0.8);

            if (nearestTree.scale <= 1) {
                nearestTree.destroy();
                this.plankCount++;
                this.gameText.setText(`Planks: ${this.plankCount}`);
            }
        }
    }

    private initCounter() {
        this.gameText = this.add.text(16, 16, "Planks: 0", {
            fontFamily: "Arial",
            color: "#ffffff",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: { left: 8, right: 8, top: 4, bottom: 4 },
        });

        this.gameText.setScrollFactor(0);
        this.gameText.setDepth(1);
    }

    private createStatIndicator() {
        // Affiche la vitesse de déplacement et le cooldown de l'épée
        const style = {
            fontFamily: "Arial",
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: { left: 8, right: 8, top: 4, bottom: 4 },
        };

        const moveSpeedText = this.add.text(
            16,
            48,
            `Vitesse : ${this.moveSpeed}`,
            style
        );
        moveSpeedText.setScrollFactor(0);
        moveSpeedText.setDepth(1);

        const swordCooldownText = this.add.text(
            16,
            80,
            `Cooldown épée : ${(this.swordCooldown / 1000).toFixed(2)}s`,
            style
        );
        swordCooldownText.setScrollFactor(0);
        swordCooldownText.setDepth(1);

        // Si besoin d'accéder plus tard, stocker dans la classe
        (this as any).moveSpeedText = moveSpeedText;
        (this as any).swordCooldownText = swordCooldownText;
    }

    private initTrees() {
        const treePositions: { x: number; y: number; radius: number }[] = [];
        const treeRadius = 15;

        for (let i = 0; i < 10; i++) {
            const centre_x = Phaser.Math.Between(64, this.scale.width - 64);
            const centre_y = Phaser.Math.Between(64, this.scale.height - 64);
            const randomTreeNumber = Phaser.Math.Between(5, 20);

            let tries = 0;
            let placed = 0;
            while (placed < randomTreeNumber && tries < randomTreeNumber * 20) {
                const angle = Phaser.Math.DegToRad(Phaser.Math.Between(0, 360));
                const t = Math.random();
                const distance = 10 + (200 - 10) * Math.pow(t, 2);
                const x = centre_x + Math.cos(angle) * distance;
                const y = centre_y + Math.sin(angle) * distance;

                let overlap = false;
                for (const pos of treePositions) {
                    const dist = Phaser.Math.Distance.Between(
                        x,
                        y,
                        pos.x,
                        pos.y
                    );
                    if (dist < treeRadius * 2) {
                        overlap = true;
                        break;
                    }
                }

                if (!overlap) {
                    this.trees.add(new Tree(this, x, y));

                    treePositions.push({ x, y, radius: treeRadius });
                    placed++;
                }
                tries++;
            }
        }
    }

    findNearestTree(): Tree | null {
        let nearestTree: Tree | null = null;
        let minDistance = Number.MAX_VALUE;

        this.trees
            .getChildren()
            .forEach((gameObject: Phaser.GameObjects.GameObject) => {
                const tree = gameObject as Tree;
                const distance = Phaser.Math.Distance.Between(
                    this.char.x,
                    this.char.y,
                    tree.x,
                    tree.y
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestTree = tree;
                }
            });

        return minDistance < this.char.cuttingRange ? nearestTree : null;
    }

    update() {
        let dx = 0;
        let dy = 0;

        //     if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        //         const pointer = this.input.activePointer;
        //         this.throwSword(pointer.worldX, pointer.worldY);
        //     }
        if (this.trees.getLength() === 2) {
            this.initTrees();
        }

        if (dx !== 0 && dy !== 0) {
            const normalFactor = 1 / Math.sqrt(2);
            dx *= normalFactor;
            dy *= normalFactor;
        }

        this.playerControls.update();
        this.char.update();

        if (
            this.plankCount > 0 &&
            this.plankCount % 5 === 0 &&
            !this.speedIncreased
        ) {
            this.moveSpeed += 20;
            this.delayAction -= 20;
            this.speedIncreased = true;
            (this as any).moveSpeedText.setText(`Vitesse : ${this.moveSpeed}`);
            (this as any).swordCooldownText.setText(
                `Cooldown épée : ${(this.swordCooldown / 1000).toFixed(2)}s`
            );
        } else if (this.plankCount % 5 !== 0) {
            this.speedIncreased = false;
        }

        if (
            this.plankCount > 0 &&
            this.plankCount % 10 === 0 &&
            !this.rangeIncreased
        ) {
            this.rangeAction += 5;
            this.rangeIncreased = true;
        } else if (this.plankCount % 10 !== 0) {
            this.rangeIncreased = false;
        }

        (this.cyclops.getChildren() as Cyclop[]).forEach((cyclop) => {
            cyclop.update();
        });
    }
}
