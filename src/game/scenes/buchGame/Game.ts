import { EventBus } from "../../EventBus";
import { Scene } from "phaser";
import { Cyclop } from "./entities/Cyclop";
import { Character } from "./entities/Character";
import { PlayerControls } from "./utils/PlayerControls";
import { Tree } from "./entities/Tree";
import { World } from "./World";
import { Minimap } from "./utils/Minimap";
import Inventory from "./utils/Inventory";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    darkOverlay: Phaser.GameObjects.Rectangle;
    fpsText: Phaser.GameObjects.Text;

    // Inventory (données uniquement, pas d'UI Phaser)
    inventory: Inventory;

    character: Phaser.Physics.Arcade.Sprite;
    trees: Phaser.Physics.Arcade.Group;
    char: Character;
    playerControls: PlayerControls;
    minimap: Minimap;
    world: World;

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
    cyclopTimer: number = 2000;
    gameTime: number = 0;

    // Life bar properties
    lifeBarContainer: Phaser.GameObjects.Container;
    lifeHearts: Phaser.GameObjects.Sprite[] = [];

    constructor() {
        super("Game");
    }

    create() {
        this.physics.world.setFPS(this.fps);

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00b47e);

        this.world = new World(this);

        this.distanceLines = this.add.graphics();

        this.swords = this.physics.add.group();

        this.trees = this.physics.add.group({
            immovable: true,
        });

        this.char = new Character(this, 300, 300, "character");
        this.playerControls = new PlayerControls(this, this.char);

        this.initLifeBar();
        this.initTrees();
        this.initCyclops();

        // Inventory setup (écriture sessionStorage uniquement)
        this.inventory = new Inventory();

        // Create dark overlay
        this.darkOverlay = this.add.rectangle(
            0,
            0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.3
        );
        this.darkOverlay.setOrigin(0, 0);
        this.darkOverlay.setScrollFactor(0);
        this.darkOverlay.setDepth(1);
        this.darkOverlay.setVisible(false);

        this.cyclopSpawnTimer = this.time.addEvent({
            delay: this.cyclopTimer,
            callback: () => {
                this.cyclops.add(new Cyclop(this, this.char));
            },
            callbackScope: this,
            loop: true,
        });

        this.minimap = new Minimap(this);

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.gameTime += 1;
                this.cyclopTimer -= this.gameTime;
            },
            callbackScope: this,
            loop: true,
        });

        // Add FPS counter
        this.fpsText = this.add.text(16, 16, "FPS: 0", {
            fontFamily: "Arial",
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: { left: 8, right: 8, top: 4, bottom: 4 },
        });
        this.fpsText.setScrollFactor(0);
        this.fpsText.setDepth(1);

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

            nearestTree.takeDamage(1);

            if (nearestTree.life <= 0) {
                this.plankCount++;
                this.gameText.setText(`Planks: ${this.plankCount}`);
                this.trees.remove(nearestTree, true, true);
                if (this.inventory) {
                    this.inventory.addItem({ id: "wood", name: "Bois" }, 1);
                    EventBus.emit("adding-item", nearestTree);
                }
            }
        }
    }

    private initLifeBar() {
        // Create container for life bar in bottom left
        this.lifeBarContainer = this.add.container(
            20,
            this.cameras.main.height - 60
        );
        this.lifeBarContainer.setScrollFactor(0);
        this.lifeBarContainer.setDepth(10000);

        const heartSpacing = 30;
        const startX = 10;
        const startY = 0;

        for (let i = 0; i < this.char.life; i++) {
            const heart = this.add.sprite(
                startX + i * heartSpacing,
                startY,
                "heart"
            );
            heart.setScale(2);
            heart.setOrigin(0, 0);

            if (i < this.char.life) {
                heart.setTint(0xff0000);
            } else {
                heart.setTint(0x666666);
            }

            this.lifeHearts.push(heart);
            this.lifeBarContainer.add(heart);
        }
    }

    private updateLifeBar() {
        if (!this.lifeHearts.length) return;

        const currentLife = this.char.life;
        const heartsToShow = currentLife;

        this.lifeHearts.forEach((heart, index) => {
            if (index < heartsToShow) {
                heart.setTint(0xff0000);
            } else {
                heart.setTint(0x666666);
            }
        });
    }

    private initTrees() {
        const treePositions: { x: number; y: number; radius: number }[] = [];
        const treeRadius = 15;
        const borderMargin = 20 + treeRadius * 2;

        for (let i = 0; i < 50; i++) {
            const centre_x = Phaser.Math.Between(
                borderMargin,
                this.world.worldWidth - borderMargin
            );
            const centre_y = Phaser.Math.Between(
                borderMargin,
                this.world.worldHeight - borderMargin
            );
            const randomTreeNumber = Phaser.Math.Between(30, 100);

            let tries = 0;
            let placed = 0;
            while (placed < randomTreeNumber && tries < randomTreeNumber * 20) {
                const angle = Phaser.Math.DegToRad(Phaser.Math.Between(0, 360));
                const t = Math.random();
                const distance = 10 + (200 - 10) * Math.pow(t, 2);
                const x = centre_x + Math.cos(angle) * distance;
                const y = centre_y + Math.sin(angle) * distance;

                if (
                    x < borderMargin ||
                    y < borderMargin ||
                    x > this.world.worldWidth - borderMargin ||
                    y > this.world.worldHeight - borderMargin
                ) {
                    tries++;
                    continue;
                }

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

        return nearestTree && minDistance < this.char.cuttingRange
            ? nearestTree
            : null;
    }

    createLineToCursor() {
        // Obtenir la position du curseur dans le monde
        const pointer = this.input.activePointer;
        const worldPoint = this.cameras.main.getWorldPoint(
            pointer.x,
            pointer.y
        );

        // Position de départ (personnage)
        const startX = this.char.x;
        const startY = this.char.y;

        // Position de fin (curseur)
        const endX = worldPoint.x;
        const endY = worldPoint.y;

        // Calculer la direction du vecteur
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        // Normaliser le vecteur direction
        const dirX = dx / distance;
        const dirY = dy / distance;

        // Trouver le premier arbre touché par la ligne
        let hitTree: Tree | null = null;
        let hitDistance = distance;

        this.trees
            .getChildren()
            .forEach((gameObject: Phaser.GameObjects.GameObject) => {
                const tree = gameObject as Tree;

                // Calculer la distance perpendiculaire de l'arbre à la ligne
                const treeToStartX = tree.x - startX;
                const treeToStartY = tree.y - startY;

                // Projection du vecteur arbre-début sur la direction de la ligne
                const projection = treeToStartX * dirX + treeToStartY * dirY;

                // Si la projection est négative, l'arbre est derrière le personnage
                if (projection < 0) return;

                // Si la projection est plus grande que la distance totale, l'arbre est au-delà du curseur
                if (projection > distance) return;

                // Calculer la distance perpendiculaire de l'arbre à la ligne
                const perpendicularX = tree.x - (startX + dirX * projection);
                const perpendicularY = tree.y - (startY + dirY * projection);
                const perpendicularDistance = Math.sqrt(
                    perpendicularX * perpendicularX +
                        perpendicularY * perpendicularY
                );

                // Vérifier si l'arbre est assez proche de la ligne (rayon de collision)
                const treeRadius = 20; // Rayon approximatif de l'arbre
                if (perpendicularDistance <= treeRadius) {
                    // Cet arbre est touché par la ligne
                    if (projection < hitDistance) {
                        hitTree = tree;
                        hitDistance = projection;
                    }
                }
            });

        // Dessiner la ligne
        this.distanceLines.clear();
        this.distanceLines.lineStyle(2, 0x00ff00, 1);

        if (hitTree) {
            // Ligne s'arrête sur l'arbre touché
            const hitX = startX + dirX * hitDistance;
            const hitY = startY + dirY * hitDistance;

            this.distanceLines.beginPath();
            this.distanceLines.moveTo(startX, startY);
            this.distanceLines.lineTo(hitX, hitY);
            this.distanceLines.strokePath();

            // Ajouter un effet visuel sur l'arbre touché
            this.tweens.add({
                targets: hitTree,
                alpha: 0.5,
                duration: 200,
                yoyo: true,
                ease: "Sine.easeInOut",
            });
        } else {
            // Ligne va jusqu'au curseur
            this.distanceLines.beginPath();
            this.distanceLines.moveTo(startX, startY);
            this.distanceLines.lineTo(endX, endY);
            this.distanceLines.strokePath();
        }

        // Effacer la ligne après un délai
        this.time.delayedCall(1000, () => {
            this.distanceLines.clear();
        });
    }

    update() {
        let dx = 0;
        let dy = 0;

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

        // Update life bar
        this.updateLifeBar();

        // Update FPS counter
        this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);

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

        if (this.char.life === 0) {
            this.scene.launch("GameOver", {
                score: this.plankCount,
            });
        }
    }
}
