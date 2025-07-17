import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    keys: Phaser.Types.Input.Keyboard.CursorKeys;
    keyZ: Phaser.Input.Keyboard.Key;
    keyQ: Phaser.Input.Keyboard.Key;
    keyS: Phaser.Input.Keyboard.Key;
    keyD: Phaser.Input.Keyboard.Key;
    keySpace: Phaser.Input.Keyboard.Key;
    keyA: Phaser.Input.Keyboard.Key;
    keyE: Phaser.Input.Keyboard.Key;

    character: Phaser.Physics.Arcade.Sprite;
    trees: Phaser.Physics.Arcade.Group;

    moveSpeed: number = 250;
    delayAction: number = 500;
    rangeAction: number = 40;

    speedIncreased: boolean = false;
    rangeIncreased: boolean = false;
    delayIncreased: boolean = false;

    cyclopGroup: Phaser.Physics.Arcade.Group;
    cyclop: Phaser.Physics.Arcade.Sprite | null;
    cyclopSpeed: number = 100;

    fps: number = 60;
    distanceLines: Phaser.GameObjects.Graphics;
    nextActionTime: number = 0;
    plankCount: number = 0;
    joystick: Phaser.GameObjects.Image | null = null;
    joystickThumb: Phaser.GameObjects.Image | null = null;
    joystickRadius: number = 60;
    joystickActive: boolean = false;
    joystickPointer: Phaser.Input.Pointer | null = null;
    actionButton: Phaser.GameObjects.Image | null = null;
    rangeButton: Phaser.GameObjects.Image | null = null;
    isMobile: boolean = false;
    rangeCircle: Phaser.GameObjects.Graphics;
    isRangeVisible: boolean = false;

    swords: Phaser.Physics.Arcade.Group | null = null;
    sword: Phaser.Physics.Arcade.Sprite | null = null;
    swordSpeed: number = 400;
    swordCooldown: number = 500;
    nextSwordTime: number = 0;

    constructor() {
        super("Game");
    }

    create() {
        this.isMobile =
            this.sys.game.device.input.touch &&
            !this.sys.game.device.os.desktop;

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
        this.rangeCircle = this.add.graphics();

        this.character = this.physics.add
            .sprite(512, 384, "character")
            .setScale(2)
            .setOrigin(0.5, 0.5)
            .setInteractive();

        this.swords = this.physics.add.group();

        this.character.setCollideWorldBounds(true);

        this.keyQ = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.Q
        );
        this.keyD = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.D
        );
        this.keyS = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.S
        );
        this.keyZ = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.Z
        );
        this.keySpace = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.keyA = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.A
        );
        this.keyE = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.E
        );

        this.trees = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });

        this.initCounter();
        this.initTrees();
        this.initCyclop();
        this.createStatIndicator();

        if (this.isMobile) {
            this.initMobileControls();
        }

        this.physics.add.collider(this.character, this.trees);

        EventBus.emit("current-scene-ready", this);
    }

    private initCyclop() {
        const randomX = Phaser.Math.Between(100, this.scale.width - 100);
        const randomY = Phaser.Math.Between(100, this.scale.height - 100);

        this.cyclop = this.physics.add
            .sprite(randomX, randomY, "cyclop")
            .setScale(2)
            .setOrigin(0.5, 0.5)
            .setInteractive();

        this.physics.add.collider(this.cyclop, this.trees);
        this.physics.add.overlap(
            this.character,
            this.cyclop,
            () => {
                this.cyclop?.destroy();
                if (this.plankCount > 0) {
                    this.plankCount -= 1;
                }
                this.gameText.setText(`Planks: ${this.plankCount}`);
                this.initCyclop();

                this.character.setScale(4, 2);
                this.character.setTint(0xff0000);
                this.tweens.add({
                    targets: this.character,
                    scale: 2,
                    tint: 0xffffff,
                    duration: 100,
                    ease: "Sine.easeInOut",
                });
            },
            undefined,
            this
        );
        this.cyclop.setCollideWorldBounds(true);

        this.cyclopGroup = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });
    }

    private initMobileControls() {
        // Création du joystick virtuel
        console.log("Initializing mobile controls...");

        this.joystick = this.add
            .image(100, this.scale.height - 100, "star")
            .setScrollFactor(0)
            .setAlpha(0.7)
            .setDepth(10)
            .setScale(0.8);

        this.joystickThumb = this.add
            .image(100, this.scale.height - 100, "star")
            .setScrollFactor(0)
            .setAlpha(0.7)
            .setDepth(11)
            .setScale(0.5);

        // Création du bouton d'action
        this.actionButton = this.add
            .image(this.scale.width - 100, this.scale.height - 100, "star")
            .setScrollFactor(0)
            .setAlpha(0.7)
            .setDepth(10)
            .setScale(0.8)
            .setInteractive();

        // Création du bouton pour afficher la portée
        this.rangeButton = this.add
            .image(this.scale.width - 100, this.scale.height - 200, "star")
            .setScrollFactor(0)
            .setAlpha(0.7)
            .setDepth(10)
            .setScale(0.8)
            .setInteractive();

        // Gestion des événements tactiles
        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (this.joystick && this.joystickThumb) {
                const distance = Phaser.Math.Distance.Between(
                    pointer.x,
                    pointer.y,
                    this.joystick.x,
                    this.joystick.y
                );

                if (distance <= this.joystickRadius) {
                    this.joystickActive = true;
                    this.joystickPointer = pointer;
                }
            }
        });

        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (
                this.joystickActive &&
                this.joystickPointer &&
                this.joystickPointer.id === pointer.id &&
                this.joystick &&
                this.joystickThumb
            ) {
                const distance = Phaser.Math.Distance.Between(
                    pointer.x,
                    pointer.y,
                    this.joystick.x,
                    this.joystick.y
                );

                const angle = Phaser.Math.Angle.Between(
                    this.joystick.x,
                    this.joystick.y,
                    pointer.x,
                    pointer.y
                );

                if (distance <= this.joystickRadius) {
                    this.joystickThumb.x = pointer.x;
                    this.joystickThumb.y = pointer.y;
                } else {
                    this.joystickThumb.x =
                        this.joystick.x + Math.cos(angle) * this.joystickRadius;
                    this.joystickThumb.y =
                        this.joystick.y + Math.sin(angle) * this.joystickRadius;
                }
            }
        });

        this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (
                this.joystickActive &&
                this.joystickPointer &&
                this.joystickPointer.id === pointer.id &&
                this.joystickThumb &&
                this.joystick
            ) {
                this.joystickActive = false;
                this.joystickThumb.x = this.joystick.x;
                this.joystickThumb.y = this.joystick.y;
            }
        });

        // Gestion du bouton d'action
        if (this.actionButton) {
            this.actionButton.on("pointerdown", () => {
                this.handleActionButton();
            });
        }
    }

    private handleActionButton() {
        if (this.time.now > this.nextActionTime) {
            const nearestTree =
                this.findNearestTree() as unknown as Phaser.Physics.Arcade.Sprite;
            if (nearestTree) {
                const currentScale = nearestTree.scale;

                nearestTree.setRotation(Phaser.Math.DegToRad(25));
                this.tweens.add({
                    targets: nearestTree,
                    rotation: 0,
                    duration: 100,
                    ease: "Sine.easeInOut",
                });
                nearestTree.setScale(currentScale * 0.8);

                // Animation charactère squeeze
                this.character.setScale(2.5, 2);
                this.tweens.add({
                    targets: this.character,
                    scale: 2,
                    duration: 100,
                    ease: "Sine.easeInOut",
                });

                if (nearestTree.scale <= 1) {
                    nearestTree.destroy();
                    this.plankCount++;
                    this.gameText.setText(`Planks: ${this.plankCount}`);
                }

                this.nextActionTime = this.time.now + this.delayAction;
            }
        }
    }

    // Implémentation des épées multiples (swords)
    private throwSword(targetX: number, targetY: number) {
        if (this.time.now < this.nextSwordTime) return;

        if (!this.swords) {
            this.swords = this.physics.add.group();
        }

        // Création d'une nouvelle épée
        const sword = this.physics.add
            .sprite(this.character.x, this.character.y, "sword")
            .setScale(2)
            .setDepth(0);

        this.swords.add(sword);

        // Collision avec les arbres
        this.physics.add.collider(sword, this.trees, (_: any, tree: any) => {
            tree.setRotation(Phaser.Math.DegToRad(25));
            this.tweens.add({
                targets: tree,
                rotation: 0,
                duration: 100,
                ease: "Sine.easeInOut",
            });
            tree.setScale(tree.scale * 0.8);

            if (tree.scale <= 1) {
                tree.destroy();
                this.plankCount++;
                this.gameText.setText(`Planks: ${this.plankCount}`);
            }
            sword.destroy();
        });

        // Collision avec le cyclope
        if (this.cyclop) {
            this.physics.add.collider(
                sword,
                this.cyclop,
                (_: any, cyclop: any) => {
                    this.cyclop?.setScale(3.5, 2);
                    this.cyclop?.setTint(0xff0000);
                    this.tweens.add({
                        targets: cyclop,
                        scale: 2,
                        tint: 0xffffff,
                        duration: 50,
                        ease: "Sine.easeInOut",
                        onComplete: () => {
                            cyclop.destroy();
                            this.cyclop = null;
                            this.time.delayedCall(1000, () => {
                                this.initCyclop();
                            });
                        },
                    });

                    sword.destroy();
                }
            );
        }

        // Calcul de l'angle et de la vélocité
        const angle = Phaser.Math.Angle.Between(
            this.character.x,
            this.character.y,
            targetX,
            targetY
        );

        sword.rotation = angle + Math.PI / 2;

        this.physics.velocityFromRotation(
            angle,
            this.swordSpeed,
            sword.body?.velocity
        );

        this.nextSwordTime = this.time.now + this.swordCooldown;

        this.time.delayedCall(2000, () => {
            if (sword && sword.active) {
                this.tweens.add({
                    targets: sword,
                    scale: 0,
                    duration: 100,
                    ease: "Sine.easeInOut",
                    onComplete: () => {
                        sword.destroy();
                    },
                });
            }
        });
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

    private createBonus() {
        const rand = Math.random();
        let typeBonus: "moveSpeed" | "swordCooldown";
        if (rand < 0.5) {
            typeBonus = "moveSpeed";
        } else {
            typeBonus = "swordCooldown";
        }

        return typeBonus;
    }

    private initTrees() {
        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.Between(64, this.scale.width - 64);
            const y = Phaser.Math.Between(64, this.scale.height - 64);
            const tree = this.physics.add
                .sprite(x, y, "tree")
                .setScale(3)
                .setDepth(10);

            tree.body.setSize(tree.width * 0.4, tree.height * 0.6);
            tree.body.setOffset(tree.width * 0.3, tree.height * 0.2);
            this.trees.add(tree);
        }
    }

    private findNearestTree() {
        let nearestTree = null;
        let minDistance = Number.MAX_VALUE;

        this.trees
            .getChildren()
            .forEach((gameObject: Phaser.GameObjects.GameObject) => {
                const tree = gameObject as Phaser.Physics.Arcade.Sprite;
                const distance = Phaser.Math.Distance.Between(
                    this.character.x,
                    this.character.y,
                    tree.x,
                    tree.y
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestTree = tree;
                }
            });

        return minDistance < this.rangeAction ? nearestTree : null;
    }

    private drawRangeCircle() {
        this.rangeCircle.clear();
        this.rangeCircle.lineStyle(2, 0xffffff, this.isRangeVisible ? 0.8 : 0);
        this.rangeCircle.strokeCircle(
            this.character.x,
            this.character.y,
            this.rangeAction
        );
    }

    // drawDistanceLines() {
    //     this.distanceLines.clear();

    //     this.trees
    //         .getChildren()
    //         .forEach((gameObject: Phaser.GameObjects.GameObject) => {
    //             const tree = gameObject as Phaser.Physics.Arcade.Sprite;
    //             const distance = Phaser.Math.Distance.Between(
    //                 this.character.x,
    //                 this.character.y,
    //                 tree.x,
    //                 tree.y
    //             );

    //             if (distance < 40) {
    //                 this.distanceLines.lineStyle(5, 0xffffff, 0.8);
    //             } else if (distance < 200) {
    //                 this.distanceLines.lineStyle(1, 0xffff00, 0.6);
    //             } else {
    //                 this.distanceLines.lineStyle(1, 0xffffff, 0);
    //             }

    //             this.distanceLines.beginPath();
    //             this.distanceLines.moveTo(this.character.x, this.character.y);
    //             this.distanceLines.lineTo(tree.x, tree.y);
    //             this.distanceLines.strokePath();
    //         });

    // }

    update() {
        this.character.setVelocity(0);

        let dx = 0;
        let dy = 0;

        if (this.isMobile) {
            // Contrôles tactiles
            if (this.joystickActive && this.joystick && this.joystickThumb) {
                const angle = Phaser.Math.Angle.Between(
                    this.joystick.x,
                    this.joystick.y,
                    this.joystickThumb.x,
                    this.joystickThumb.y
                );

                const distance = Phaser.Math.Distance.Between(
                    this.joystick.x,
                    this.joystick.y,
                    this.joystickThumb.x,
                    this.joystickThumb.y
                );

                // Normalisation de la distance pour obtenir une valeur entre 0 et 1
                const intensity = Phaser.Math.Clamp(
                    distance / this.joystickRadius,
                    0,
                    1
                );

                dx = Math.cos(angle) * intensity;
                dy = Math.sin(angle) * intensity;
            }
        } else {
            if (this.keyQ.isDown) {
                dx -= 1;
                this.character.setFlipX(true);
            }
            if (this.keyD.isDown) {
                dx += 1;
                this.character.setFlipX(false);
            }
            if (this.keyS.isDown) {
                dy += 1;
            }
            if (this.keyZ.isDown) {
                dy -= 1;
            }

            if (this.keySpace.isDown && this.time.now > this.nextActionTime) {
                this.handleActionButton();
            }

            if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                const pointer = this.input.activePointer;
                this.throwSword(pointer.worldX, pointer.worldY);
            }

            if (Phaser.Input.Keyboard.JustDown(this.keyA)) {
                this.isRangeVisible = true;
            }

            if (Phaser.Input.Keyboard.JustUp(this.keyA)) {
                this.isRangeVisible = false;
            }
        }

        if (this.trees.getLength() === 2) {
            this.initTrees();
        }

        if (dx !== 0 && dy !== 0) {
            const normalFactor = 1 / Math.sqrt(2);
            dx *= normalFactor;
            dy *= normalFactor;
        }

        this.character.setVelocity(dx * this.moveSpeed, dy * this.moveSpeed);

        if (this.cyclop) {
            const cyclopAngle = Phaser.Math.Angle.Between(
                this.cyclop.x,
                this.cyclop.y,
                this.character.x,
                this.character.y
            );

            this.cyclop.setVelocity(
                Math.cos(cyclopAngle) * this.cyclopSpeed,
                Math.sin(cyclopAngle) * this.cyclopSpeed
            );

            const distanceToCharacter = Phaser.Math.Distance.Between(
                this.character.x,
                this.character.y,
                this.cyclop.x,
                this.cyclop.y
            );

            if (distanceToCharacter < 100) {
                true;
            }
        }

        // Dessiner le cercle de portée
        this.drawRangeCircle();

        // this.drawDistanceLines();
        // Augmente la vitesse et réduit le délai d'action tous les 10 planches
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
    }
}
