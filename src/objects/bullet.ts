import { Textures } from "./textures";

export class Bullet extends Phaser.Physics.Arcade.Image {
    private speed: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, Textures.get('laser'));
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = 600;
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        this.y -= this.speed * (delta / 1000);

        if (this.y < -50) {
            this.destroy();
        }
    }
}