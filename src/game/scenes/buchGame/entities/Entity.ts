import Phaser from "phaser";
import { Game } from "../Game";

export class Entity extends Phaser.Physics.Arcade.Sprite {
    public scene: Game;
    public life: number;
    public maxLife: number;
    public damage: number;
    public delayAttack: number;
    public speed: number;
    public currentSpeed: number;
    private lifeBar: Phaser.GameObjects.Graphics | null = null;

    private dashDuration: number = 100;
    private dashSpeed: number = 800;
    private dashCooldown: number = 1000;
    private dashTime: number = 0;

    constructor(scene: Game, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        this.scene = scene;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2);
        this.setOrigin(0.5, 0.5);

        this.maxLife = 3;
        this.life = this.maxLife;
        this.damage = 1;
        this.delayAttack = 500;
        this.speed = 100;
        this.currentSpeed = this.speed;
    }

    createEntityLifeBar() {
        if (this.lifeBar) {
            this.lifeBar.destroy();
        }
        const barWidth = 40;
        const barHeight = 6;
        const offsetY = -30;
        const graphics = this.scene.add.graphics();

        graphics.setDepth(1000);
        graphics.fillStyle(0xffffff, 0.8);
        graphics.fillRect(0, 0, barWidth, barHeight);

        const life = this.life ?? this.maxLife;
        const lifeWidth = barWidth * (life / this.maxLife);
        graphics.fillStyle(0xff4444, 1);
        graphics.fillRect(0, 0, lifeWidth, barHeight);

        graphics.x = this.x - barWidth / 2;
        graphics.y = this.y + offsetY;

        this.lifeBar = graphics;
    }

    updateEntityLifeBar() {
        if (this.lifeBar) {
            const life = this.life ?? this.maxLife;

            if (this.life === this.maxLife) {
                this.lifeBar.setVisible(false);
            } else {
                this.lifeBar.setVisible(true);
            }

            const barWidth = 40;
            const lifeWidth = barWidth * (life / this.maxLife);
            this.lifeBar.clear();
            this.lifeBar.fillStyle(0xffffff, 0.8);
            this.lifeBar.fillRect(0, 0, barWidth, 6);
            this.lifeBar.fillStyle(0xff4444, 1);
            this.lifeBar.fillRect(0, 0, lifeWidth, 6);
            this.lifeBar.x = this.x - barWidth / 2;
            this.lifeBar.y = this.y - 30;
        }
    }

    destroyEntityLifeBar() {
        if (this.lifeBar) {
            this.scene.tweens.add({
                targets: this.lifeBar,
                alpha: 0,
                duration: 100,
                onComplete: () => {
                    if (this.lifeBar) {
                        this.lifeBar.destroy();
                        this.lifeBar = null;
                    }
                },
            });
        }
    }

    destroy(fromScene?: boolean): void {
        this.scene.tweens.add({
            targets: this,
            scale: 0,
            alpha: 0,
            duration: 100,
            onComplete: () => {
                super.destroy(fromScene);
            },
        });
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
                            this.setScale(2);
                            this.setTint(0xffffff);
                        },
                    });
                },
            });
        }
    }

    dash() {
        if (this.scene.time.now < this.dashTime + this.dashCooldown) {
            return;
        }

        this.fantomatique();

        const vitesseNormale = this.currentSpeed;
        this.currentSpeed = this.dashSpeed;

        this.scene.time.delayedCall(this.dashDuration, () => {
            this.currentSpeed = vitesseNormale;
        });

        this.dashTime = this.scene.time.now;
    }

    fantomatique() {
        const nombreDeFantomes = 5;
        const fantomes: Phaser.GameObjects.Image[] = [];
        const positionsPrecedentes: { x: number; y: number }[] = [];

        for (let i = 0; i < (nombreDeFantomes + 1) * 3; i++) {
            positionsPrecedentes.push({
                x: this.x,
                y: this.y,
            });
        }

        for (let i = 0; i < nombreDeFantomes; i++) {
            const fantome = this.scene.add
                .image(this.x, this.y, "character")
                .setScale(2)
                .setOrigin(0.5, 0.5)
                .setTint(0x00ffff)
                .setAlpha(0.5 - i * 0.1)
                .setDepth(this.depth - (i + 1));
            fantomes.push(fantome);
        }

        const updateFantomes = () => {
            positionsPrecedentes.unshift({
                x: this.x,
                y: this.y,
            });
            positionsPrecedentes.pop();

            for (let i = 0; i < nombreDeFantomes; i++) {
                const indexPosition = i + 1;
                if (positionsPrecedentes[indexPosition]) {
                    fantomes[i].x = positionsPrecedentes[indexPosition].x;
                    fantomes[i].y = positionsPrecedentes[indexPosition].y;
                }
            }
        };

        this.scene.events.on("update", updateFantomes);

        this.scene.time.delayedCall(this.dashDuration, () => {
            fantomes.forEach((f) => f.destroy());
            this.scene.events.off("update", updateFantomes);
        });
    }
}
