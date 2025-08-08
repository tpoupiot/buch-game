// src/game/scenes/utils/PlayerControls.ts

import Phaser from "phaser";
import { Character } from "../entities/Character";
import { Game } from "../Game";

export class PlayerControls {
    private character: Character;
    private scene: Game;

    private keyZ: Phaser.Input.Keyboard.Key;
    private keyQ: Phaser.Input.Keyboard.Key;
    private keyS: Phaser.Input.Keyboard.Key;
    private keyD: Phaser.Input.Keyboard.Key;

    private keyA: Phaser.Input.Keyboard.Key;
    private keyE: Phaser.Input.Keyboard.Key;
    private keySpace: Phaser.Input.Keyboard.Key;
    private keyShift: Phaser.Input.Keyboard.Key;

    private leftClick: boolean = false;

    constructor(scene: Game, character: Character) {
        this.character = character;
        this.scene = scene;

        this.keyZ = scene.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.Z
        );
        this.keyQ = scene.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.Q
        );
        this.keyS = scene.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.S
        );
        this.keyD = scene.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.D
        );
        this.keyA = scene.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.A
        );
        this.keyE = scene.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.E
        );
        this.keySpace = scene.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.keyShift = scene.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.SHIFT
        );

        scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.leftClick = true;
            }
        });

        scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonReleased()) {
                this.leftClick = false;
            }
        });
    }

    isLeftClickPressed(): boolean {
        return this.leftClick;
    }

    update() {
        let dx = 0,
            dy = 0;

        // Keys
        if (this.keyQ.isDown) dx -= 1;
        if (this.keyD.isDown) dx += 1;
        if (this.keyZ.isDown) dy -= 1;
        if (this.keyS.isDown) dy += 1;

        if (Phaser.Input.Keyboard.JustDown(this.keyA)) {
            this.character.isRangeVisible = !this.character.isRangeVisible;
            console.log(
                `Range visibility toggled: ${this.character.isRangeVisible}`
            );
        }

        if (this.isLeftClickPressed()) {
            this.character.handleThrowAction();
        }

        if (this.keySpace.isDown) {
            this.scene.handleCutAction();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyShift)) {
            this.character.dash();
        }

        if (dx !== 0 && dy !== 0) {
            const normalFactor = 1 / Math.sqrt(2);
            dx *= normalFactor;
            dy *= normalFactor;
        }

        this.character.setVelocity(
            dx * this.character.currentSpeed,
            dy * this.character.currentSpeed
        );
    }
}
