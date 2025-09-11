export class Enemy extends Phaser.Physics.Arcade.Image {
    private speed: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = -50;


        scene.tweens.add({
            targets: this,
            x: x + 200,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Linear',
        });
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        this.y -= this.speed * (delta / 1000);

        if (this.y > 1000) {
            this.destroy();
        }
    }
}