export class Enemy extends Phaser.Physics.Arcade.Image {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const movementDuration = 4000;

        const direction = x < 225 ? 1 : -1;

        scene.tweens.add({
            targets: this,
            x: x + (250 * direction),
            duration: movementDuration,
            yoyo: false,
            repeat: -1,
            repeatDelay: 500,
            ease: 'Linear',
        });

        scene.tweens.add({
            targets: this,
            y: y + 800,
            duration: movementDuration / 2,
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


                scene.time.delayedCall((movementDuration / 2) - 250, () => {
                    scene.tweens.add({
                        targets: this,
                        angle: -180 * (direction),
                        duration: 500,
                    });
                });

            }
        });

        scene.time.delayedCall((movementDuration / 2) - 250, () => {
            scene.tweens.add({
                targets: this,
                angle: -180 * (direction),
                duration: 500,
            });
        });

    }

    update(time: number, delta: number) {
        super.update(time, delta);
    }
}