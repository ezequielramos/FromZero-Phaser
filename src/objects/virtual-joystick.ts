export class VirtualJoystick {
    scene: Phaser.Scene;
    base: Phaser.GameObjects.Arc;
    thumb: Phaser.GameObjects.Arc;
    acceptableRadius: Phaser.GameObjects.Arc;
    radius: number;
    pointerId: number | null = null;
    direction: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

    constructor(scene: Phaser.Scene, x: number, y: number, radius: number) {
        this.scene = scene;
        this.radius = radius;

        this.acceptableRadius = scene.add.circle(x, y, radius * 4, 0xff0000, 0.0);
        this.acceptableRadius.setScrollFactor(0);
        this.acceptableRadius.setInteractive({ draggable: true });

        this.base = scene.add.circle(x, y, radius, 0x888888, 0.5);
        this.base.setScrollFactor(0);

        this.thumb = scene.add.circle(x, y, radius * 0.4, 0xffffff, 0.8);
        this.thumb.setScrollFactor(0);

        scene.input.on('dragstart', (pointer: { id: number; }, gameObject: Phaser.GameObjects.Arc) => {
            if (gameObject === this.acceptableRadius) {
                this.pointerId = pointer.id;
            }
        });

        scene.input.on('drag', (pointer: { id: number; }, gameObject: Phaser.GameObjects.Arc, dragX: number, dragY: number) => {
            if (gameObject === this.acceptableRadius && this.pointerId === pointer.id) {
                const dx = dragX - this.base.x;
                const dy = dragY - this.base.y;

                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                const maxDist = this.radius;
                const clampedDist = Math.min(dist, maxDist);

                this.thumb.x = this.base.x + Math.cos(angle) * clampedDist;
                this.thumb.y = this.base.y + Math.sin(angle) * clampedDist;

                this.direction.set(Math.cos(angle) * (clampedDist / maxDist), Math.sin(angle) * (clampedDist / maxDist));
            }
        });

        scene.input.on('dragend', (pointer: { id: number; }, gameObject: Phaser.GameObjects.Arc) => {
            if (gameObject === this.acceptableRadius && this.pointerId === pointer.id) {
                this.thumb.x = this.base.x;
                this.thumb.y = this.base.y;
                this.direction.set(0, 0);
                this.pointerId = null;
            }
        });
    }

    getDirection(): Phaser.Math.Vector2 {
        return this.direction.clone();
    }
}