import Phaser from "phaser";
import { Boomerang } from "./enemies/boomerang";
import { Player } from "./player";
import { StarsPool } from "./stars-pool";
import { Textures } from "./textures";
import { Pursuer } from "./enemies/pursuer";

export class MainScene extends Phaser.Scene {
    private ship!: Phaser.Physics.Arcade.Image;
    private enemies!: Phaser.Physics.Arcade.Group[];
    private numberOfEnemies = 1;
    private starsPool!: StarsPool;

    preload() {
        Textures.load(this, "ship");
        Textures.load(this, "laser");
        Textures.load(this, "boomerang");
        Textures.load(this, "spark");
        Textures.load(this, "pursuer");
    }

    create() {

        this.starsPool = new StarsPool(this, 100);
        for (let i = 0; i < 50; i++) {
            this.starsPool.spawn(Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, this.scale.height), Phaser.Math.Between(50, 200));
        }

        this.enemies = [this.physics.add.group({
            classType: Boomerang,
            runChildUpdate: true,
        }), this.physics.add.group({
            classType: Pursuer,
            runChildUpdate: true,
        })];

        for (let i = 0; i < this.numberOfEnemies; i++) {
            this.enemies[0].create(150, -30);
        }

        this.startPlayer();

    }

    startPlayer() {
        this.ship = new Player(this, 225, 600, this.enemies, () => {
            this.numberOfEnemies = 0;
            this.startPlayer();
        });
    }

    update(time: number, delta: number) {

        this.starsPool.update(delta, this.scale.height);

        if (Phaser.Math.Between(0, 10) > 8) {
            this.starsPool.spawn(Phaser.Math.Between(0, this.scale.width), 0, Phaser.Math.Between(50, 200));
        }

        if (this.enemies[0].getLength() === 0) {
            this.numberOfEnemies += 1;
            for (let i = 0; i < this.numberOfEnemies; i++) {
                const random = Phaser.Math.Between(0, 450);
                this.enemies[0].create(random, -30 - (i * 30));
            }
            const x = Phaser.Math.RND.pick([25, 425]);
            const pursuer = new Pursuer(this, x, -30, this.ship);
            this.enemies[1].add(pursuer);
        }

        this.ship.update(time, delta);
    }
}