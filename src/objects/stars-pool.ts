export class StarsPool {
    private pool: Phaser.GameObjects.Rectangle[] = [];
    private active: Phaser.GameObjects.Rectangle[] = [];

    constructor(scene: Phaser.Scene, size: number) {
        for (let i = 0; i < size; i++) {
            const color = Phaser.Math.RND.pick([0xffffff, 0xfff8d0, 0xa0d8ff, 0xc8a0ff, 0xffb0f0]);
            const rect = scene.add.rectangle(-10, -10, 2, 2, color);
            rect.setVisible(false);
            this.pool.push(rect);
        }
    }

    spawn(x: number, y: number, speed: number) {
        if (this.pool.length === 0) return;
        const rect = this.pool.pop()!;
        rect.setPosition(x, y);
        rect.setVisible(true);
        (rect as any).speed = speed;
        this.active.push(rect);
    }

    update(delta: number, height: number) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const rect = this.active[i] as any;
            rect.y += rect.speed * (delta / 1000);

            if (rect.y > height) {
                rect.setVisible(false);
                rect.y = -10;
                this.pool.push(rect);
                this.active.splice(i, 1);
            }
        }
    }
}