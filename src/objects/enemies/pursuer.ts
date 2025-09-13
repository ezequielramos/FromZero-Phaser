import { Textures } from "../textures";

export class Pursuer extends Phaser.Physics.Arcade.Image {

    constructor(scene: Phaser.Scene, x: number, y: number, target: Phaser.Physics.Arcade.Image) {
        super(scene, x, y, Textures.get('pursuer'));
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const movementDuration = 4000;


        scene.tweens.add({
            targets: this,
            y: y + 600,
            duration: movementDuration / 2,
            ease: 'Sine.easeInOut',
        });

        scene.time.delayedCall((movementDuration / 2), () => {
            if (!this.active) {
                return;
            }
            const currentTarget = { x: target.x, y: target.y };
            const angleToTarget = Phaser.Math.Angle.Between(this.x, this.y, currentTarget.x, currentTarget.y);

            scene.tweens.add({
                targets: this,
                rotation: angleToTarget - Math.PI / 2,
                duration: 200,
                ease: "Sine.easeInOut"
            });

            scene.time.delayedCall(200, () => {
                if (!this.active) {
                    return;
                }
                scene.physics.moveToObject(this, currentTarget, 200);
            });

        });

    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (this.y < -50) {
            this.destroy();
        }
        if (this.y > 850) {
            this.destroy();
        }
        if (this.x < -50) {
            this.destroy();
        }
        if (this.x > 500) {
            this.destroy();
        }
    }
}