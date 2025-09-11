export class Enemy extends Phaser.Physics.Arcade.Image {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);


        scene.tweens.add({
            targets: this,
            x: x + 200,
            duration: 3000,
            yoyo: false,
            repeat: -1,
            repeatDelay: 500,
            ease: 'Linear',
        });

        scene.tweens.add({
            targets: this,
            y: y + 600,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            repeatDelay: 500,
            ease: 'Sine.easeInOut',
            onRepeat: () => {
                scene.tweens.add({
                    targets: this,
                    angle: 0,
                    duration: 0,
                });


                scene.time.delayedCall(1250, () => {
                    scene.tweens.add({
                        targets: this,
                        angle: -180,
                        duration: 500,
                    });
                });

            }
        });

        scene.time.delayedCall(1250, () => {
            scene.tweens.add({
                targets: this,
                angle: -180,
                duration: 500,
            });
        });

    }

    update(time: number, delta: number) {
        super.update(time, delta);
    }
}