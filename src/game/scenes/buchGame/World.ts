import { Game } from "./Game";

const TILE_WEIGHTS = {
    grass: 15,
    fern: 5,
    flower: 1,
};

export class World {
    scene: Game;
    private backgroundTiles: Phaser.GameObjects.Image[] = [];

    readonly worldHeight: number = 5000;
    readonly worldWidth: number = 5000;

    constructor(scene: Game) {
        this.scene = scene;

        this.setupWorldBounds();
        this.createWorldTiles();
    }

    private setupWorldBounds() {
        this.scene.physics.world.setBounds(
            0,
            0,
            this.worldHeight,
            this.worldWidth
        );

        this.scene.cameras.main.setBounds(
            0,
            0,
            this.worldHeight,
            this.worldWidth
        );
    }

    private createWorldTiles() {
        const cols = Math.ceil(this.worldWidth / 48);
        const rows = Math.ceil(this.worldHeight / 48);

        const weightedTileKeys: string[] = [];

        Object.entries(TILE_WEIGHTS).forEach(([key, weight]) => {
            for (let i = 0; i < weight; i++) {
                weightedTileKeys.push(key);
            }
        });

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const tileKey = Phaser.Utils.Array.GetRandom(weightedTileKeys);
                const x = col * 48;
                const y = row * 48;

                const tile = this.scene.add
                    .image(x, y, tileKey)
                    .setOrigin(0, 0)
                    .setScale(3)
                    .setScrollFactor(1)
                    .setDepth(-2);

                this.backgroundTiles.push(tile);
            }
        }
    }
}
