import { Game } from "../Game";
import { World } from "../World";

/**
 * Minimap transformé en GameObject Phaser.
 * Il hérite de Phaser.GameObjects.Container pour pouvoir être ajouté à la scène comme un GameObject.
 *
 * Note : setDepth ne fonctionne pas ici car le Graphics est ajouté dans le Container,
 * et le Container n'est pas affecté par setDepth de ses enfants. Pour garantir que la minimap
 * soit toujours au-dessus, il faut s'assurer que le Container lui-même est ajouté après les autres éléments,
 * ou utiliser setDepth sur le Container lui-même.
 */
export class Minimap extends Phaser.GameObjects.Container {
    scene: Game;
    world: World;
    private minimapGraphics: Phaser.GameObjects.Graphics;
    private minimapWidth: number = 196;
    private minimapHeight: number = 196;
    private minimapMargin: number = 16;

    constructor(scene: Game) {
        super(scene, 0, 0);
        this.scene = scene;
        this.world = scene.world;

        // Ajout du container à la scène
        this.scene.add.existing(this);

        // Création du graphics pour la minimap
        this.minimapGraphics = scene.add.graphics();
        this.add(this.minimapGraphics);

        // Le scrollFactor doit être mis à 0 pour que la minimap reste fixe à l'écran
        this.setScrollFactor(0);

        // setDepth ne fonctionne pas sur le graphics à l'intérieur du container,
        // il faut le faire sur le container lui-même
        this.setDepth(1000);

        this.drawMinimapBackground();
        this.drawPlayer();
        this.drawTrees();
        this.drawCyclops();
    }

    private drawMinimapBackground() {
        this.minimapGraphics.clear();
        this.minimapGraphics.fillStyle(0x000000, 0.5);

        this.minimapGraphics.fillRect(
            this.scene.camera.width - this.minimapWidth - this.minimapMargin,
            this.scene.camera.height - this.minimapHeight - this.minimapMargin,
            this.minimapWidth + 5,
            this.minimapHeight + 5
        );
    }

    private drawPlayer() {
        if ((this.scene as any).char) {
            const char = (this.scene as any).char;
            const worldX = char.x;
            const worldY = char.y;

            const scale = this.minimapWidth / this.world.worldWidth;
            const minimapX =
                this.scene.camera.width -
                this.minimapWidth -
                this.minimapMargin +
                worldX * scale;
            const minimapY =
                this.scene.camera.height -
                this.minimapHeight -
                this.minimapMargin +
                worldY * scale;
            this.minimapGraphics.fillStyle(0x00ffff, 1);
            this.minimapGraphics.fillRect(minimapX, minimapY, 4, 4);
        }
    }

    private drawTrees() {
        if ((this.scene as any).trees) {
            const trees = (this.scene as any).trees.getChildren();
            const scale = this.minimapWidth / this.world.worldWidth;
            for (const tree of trees) {
                const worldX = tree.x;
                const worldY = tree.y;

                const minimapX =
                    this.scene.camera.width -
                    this.minimapWidth -
                    this.minimapMargin +
                    worldX * scale;
                const minimapY =
                    this.scene.camera.height -
                    this.minimapHeight -
                    this.minimapMargin +
                    worldY * scale;
                this.minimapGraphics.fillStyle(0x228b22, 1);
                this.minimapGraphics.fillRect(minimapX, minimapY, 3, 3);
            }
        }
    }

    private drawCyclops() {
        if ((this.scene as any).cyclops) {
            const cyclops = (this.scene as any).cyclops.getChildren();
            const scale = this.minimapWidth / this.world.worldWidth;
            for (const cyclop of cyclops) {
                const worldX = cyclop.x;
                const worldY = cyclop.y;
                const minimapX =
                    this.scene.camera.width -
                    this.minimapWidth -
                    this.minimapMargin +
                    worldX * scale;
                const minimapY =
                    this.scene.camera.height -
                    this.minimapHeight -
                    this.minimapMargin +
                    worldY * scale;
                this.minimapGraphics.fillStyle(0xff0000, 1);
                this.minimapGraphics.fillRect(minimapX, minimapY, 4, 4);
            }
        }
    }

    preUpdate() {
        this.drawMinimapBackground();
        this.drawTrees();
        this.drawCyclops();
        this.drawPlayer();
    }
}
