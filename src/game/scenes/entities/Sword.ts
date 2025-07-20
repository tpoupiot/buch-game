import { Game } from "../Game";
import { Entity } from "./Entity";

export class Sword extends Entity {
    angle: number = 0;

    constructor(scene: Game, x: number, y: number, target: Entity) {
        super(scene, x, y, "sword");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.damage = 1;
        this.delayAttack = 500;
        this.speed = 100;
        this.currentSpeed = this.speed;

        const angle = Phaser.Math.Angle.Between(
            target.x,
            target.y,
            scene.input.activePointer.worldX,
            scene.input.activePointer.worldY
        );
        this.rotation = angle + Math.PI / 2; // Adjust rotation to point towards the target

        scene.physics.velocityFromRotation(
            angle,
            this.speed,
            this.body.velocity
        );

        this.setDepth(1000);
    }
}
