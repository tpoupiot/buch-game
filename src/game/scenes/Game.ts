import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    character: Phaser.Physics.Arcade.Sprite;
    trees: Phaser.Physics.Arcade.Group;
    keys: Phaser.Types.Input.Keyboard.CursorKeys;
    keyZ: Phaser.Input.Keyboard.Key;
    keyQ: Phaser.Input.Keyboard.Key;
    keyS: Phaser.Input.Keyboard.Key;
    keyD: Phaser.Input.Keyboard.Key;
    keySpace: Phaser.Input.Keyboard.Key;
    keyA: Phaser.Input.Keyboard.Key;
    keyE: Phaser.Input.Keyboard.Key;

    moveSpeed: number = 250;
    delayAction: number = 500;
    rangeAction: number = 40;

    speedIncreased: boolean = false;
    rangeIncreased: boolean = false;
    delayIncreased: boolean = false;

    fps: number = 60;
    distanceLines: Phaser.GameObjects.Graphics;
    nextActionTime: number = 0;
    plankCount: number = 9;
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
    sword: Phaser.Physics.Arcade.Sprite | null = null;
    swordSpeed: number = 400;
    swordCooldown: number = 2000;
    nextSwordTime: number = 0;

    constructor() {
        super("Game");
    }

    create() {
        // Détection si l'appareil est mobile
        this.isMobile =
            this.sys.game.device.input.touch &&
            !this.sys.game.device.os.desktop;

        console.log("isMobile:", this.isMobile);

        // Configuration du framerate à 60 FPS
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

        this.character.setCollideWorldBounds(true);

        // Configuration des contrôles clavier pour desktop
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

        // Initialisation des contrôles tactiles pour mobile
        if (this.isMobile) {
            this.initMobileControls();
        }

        this.physics.add.collider(this.character, this.trees);

        EventBus.emit("current-scene-ready", this);
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

    private throwSword(targetX: number, targetY: number) {
        if (this.time.now < this.nextSwordTime) return;

        this.sword = this.physics.add
            .sprite(this.character.x, this.character.y, "sword")
            .setScale(2)
            .setDepth(0);
        this.sword.setCollideWorldBounds(true);

        this.physics.add.collider(this.sword, this.trees, (_, tree) => {
            tree.destroy();
            this.plankCount++;
            this.gameText.setText(`Planks: ${this.plankCount}`);

            if (this.sword) {
                this.sword.destroy();
                this.sword = null;
            }
        });

        const angle = Phaser.Math.Angle.Between(
            this.character.x,
            this.character.y,
            targetX,
            targetY
        );

        this.sword.rotation = angle + Math.PI / 2;

        this.physics.velocityFromRotation(
            angle,
            this.swordSpeed,
            this.sword.body?.velocity
        );

        this.nextSwordTime = this.time.now + this.swordCooldown;

        this.time.delayedCall(2000, () => {
            if (this.sword) {
                this.sword.destroy();
                this.sword = null;
            }
        });
    }

    private initCounter() {
        this.gameText = this.add.text(16, 16, "Planks: 0", {
            fontSize: "32px",
        });

        this.gameText.setScrollFactor(0);
        this.gameText.setDepth(1);
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

        // Dessiner le cercle de portée
        this.drawRangeCircle();

        // this.drawDistanceLines();
        // Augmente la vitesse et réduit le délai d'action tous les 10 planches
        if (
            this.plankCount > 0 &&
            this.plankCount % 5 === 0 &&
            !this.speedIncreased
        ) {
            this.moveSpeed += 50;
            this.delayAction -= 100;
            this.speedIncreased = true;
        } else if (this.plankCount % 5 !== 0) {
            this.speedIncreased = false;
        }

        if (
            this.plankCount > 0 &&
            this.plankCount % 10 === 0 &&
            !this.rangeIncreased
        ) {
            this.rangeAction += 20;
            this.rangeIncreased = true;
        } else if (this.plankCount % 10 !== 0) {
            this.rangeIncreased = false;
        }
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

    findNearestTree() {
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
}
