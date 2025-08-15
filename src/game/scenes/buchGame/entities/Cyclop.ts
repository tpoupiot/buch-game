import { Game } from "../Game";
import { Entity } from "./Entity";

export class Cyclop extends Entity {
    target: Entity;
    isSlowedByTree: boolean = false;
    currentSpeed: number;
    slowTimeout?: ReturnType<typeof setTimeout>;
    cyclopSpeed: number;
    isOverlapping: boolean = false;
    private animationTimer: number = 0;
    private animationDelay: number = 250;
    private currentFrame: number = 0;
    private lastFootprintTime = 0;
    private footprintDelay = 300;
    private isBig: boolean = false;

    constructor(scene: Game, target: Entity, x?: number, y?: number) {
        const posX = x
            ? x
            : Phaser.Math.Between(100, scene.world.worldWidth - 100);
        const posY = y
            ? y
            : Phaser.Math.Between(100, scene.world.worldHeight - 100);
        super(scene, posX, posY, "cyclop");

        this.isBig = Math.random() < 0.1;

        if (this.isBig) {
            this.maxLife = 10;
            this.setScale(3);
            this.cyclopSpeed = 50;
        } else {
            this.maxLife = 5;
            this.setScale(2);
            this.cyclopSpeed = 80;
        }

        this.life = this.maxLife;
        this.target = target;
        this.createEntityLifeBar();
        this.setCollideWorldBounds(true);
        this.currentSpeed = this.cyclopSpeed;

        this.dashSpeed = 400;
        this.dashCooldown = 10000;

        scene.physics.add.overlap(
            scene.char,
            this,
            () => {
                if (!this.active) return;
                if (this.isOverlapping) return;

                this.isOverlapping = true;
                this.destroyEntityLifeBar();
                this.destroy();
                scene.char.takeDamage(this.damage);

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

        scene.physics.add.collider(this, scene.cyclops);
    }

    takeDamage(damage: number) {
        this.life -= damage;

        const particles = this.scene.add.particles(0, 0, "grass", {
            speed: { min: 50, max: 100 },
            scale: { start: 0.75, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: 0xff0000,
            lifespan: 500,
            quantity: 0,
            angle: { min: 0, max: 360 },
        });

        particles.emitParticleAt(this.x, this.y, 20);
        particles.setDepth(this.depth - 1);

        // Destroy particles after animation
        this.scene.time.delayedCall(500, () => {
            particles.destroy();
        });

        if (this.life <= 0) {
            this.destroyEntityLifeBar();
            this.destroy();
        } else {
            this.updateEntityLifeBar();
            this.setRotation(Phaser.Math.DegToRad(-25));
            this.setTint(0xff0000);

            this.scene.tweens.add({
                targets: this,
                rotation: Phaser.Math.DegToRad(25),
                tint: 0xff0000,
                duration: 100,
                ease: "Sine.easeInOut",

                onComplete: () => {
                    this.scene.tweens.add({
                        targets: this,
                        rotation: 0,
                        tint: 0xffffff,
                        duration: 100,
                        ease: "Sine.easeInOut",
                        onComplete: () => {
                            this.setScale(this.isBig ? 3 : 2);
                            this.setTint(0xffffff);
                        },
                    });
                },
            });
        }
    }

    private createFootprint() {
        if (!this.body) return;

        const now = this.scene.time.now;
        if (
            now - this.lastFootprintTime > this.footprintDelay &&
            (this.body.velocity.x !== 0 || this.body.velocity.y !== 0)
        ) {
            this.lastFootprintTime = now;

            this.scene.tweens.add({
                targets: this,
                rotation: 0.05,
                duration: 125,
                yoyo: true,
                ease: "Sine.easeInOut",

                onComplete: () => {
                    this.setScale(this.isBig ? 3 : 2);
                    this.scene.tweens.add({
                        targets: this,
                        rotation: -0.05,
                        duration: 125,
                        ease: "Sine.easeInOut",
                        yoyo: true,

                        onComplete: () => {
                            this.setRotation(0);
                        },
                    });
                },
            });
        }
    }

    update() {
        super.update();
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

        // Try to dash every time it's available
        if (this.scene.time.now > this.dashTime + this.dashCooldown) {
            this.dash();
        }

        this.updateEntityLifeBar();
        this.createFootprint();

        const now = this.scene.time.now;
        if (now - this.animationTimer > this.animationDelay) {
            this.animationTimer = now;
            this.currentFrame = this.currentFrame === 0 ? 1 : 0;

            const textureKey =
                this.currentFrame === 0 ? "cyclop-moving1" : "cyclop-moving2";
            this.setTexture(textureKey);
        }
    }
}
