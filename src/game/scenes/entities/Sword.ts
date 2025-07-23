import { Game } from "../Game";
import { Cyclop } from "./Cyclop";
import { Entity } from "./Entity";

export class Sword extends Entity {
    angle: number = 0;
    isOverlapping: boolean = false;
    delayAttack: number;
    throwTime: number = 0;

    constructor(scene: Game, x: number, y: number, target: Entity) {
        super(scene, x, y, "sword");

        this.damage = 1;
        this.delayAttack = 10;
        this.speed = 300;
        this.currentSpeed = this.speed;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        const angle = Phaser.Math.Angle.Between(
            target.x,
            target.y,
            scene.input.activePointer.worldX,
            scene.input.activePointer.worldY
        );
        this.rotation = angle + Math.PI / 2;

        scene.physics.velocityFromRotation(
            angle,
            this.speed,
            this.body?.velocity
        );

        this.setDepth(1000);

        scene.physics.add.overlap(
            this,
            scene.cyclops,
            (sword: Sword, cyclop: Cyclop) => {
                if (!sword.active || !cyclop.active) return;
                if (sword.isOverlapping) return;
                sword.isOverlapping = true;
                sword.destroy();
                cyclop.takeDamage(sword.damage);
            },
            undefined,
            this
        );

        scene.physics.add.overlap(
            this,
            scene.trees,
            (sword: Sword, tree: Entity) => {
                if (!sword.active || !tree.active) return;
                if (sword.isOverlapping) return;
                sword.isOverlapping = true;
                tree.takeDamage(sword.damage);
                sword.destroy();
            }
        );
    }

    destroy(fromScene?: boolean) {
        super.destroy(fromScene);
    }

    preUpdate() {
        if (
            this.x < 0 ||
            this.x > this.scene.scale.width ||
            this.y < 0 ||
            this.y > this.scene.scale.height
        ) {
            this.destroy();
        }
    }
}
