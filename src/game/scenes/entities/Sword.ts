import { Game } from "../Game";
import { Cyclop } from "./Cyclop";
import { Entity } from "./Entity";

export class Sword extends Entity {
    angle: number = 0;
    isOverlapping: boolean = false;

    constructor(scene: Game, x: number, y: number, target: Entity) {
        super(scene, x, y, "sword");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.damage = 1;
        this.delayAttack = 500;
        this.speed = 200;
        this.currentSpeed = this.speed;
        this.maxLife = 4;

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
    }

    destroy(fromScene?: boolean) {
        super.destroy(fromScene);
    }
}
