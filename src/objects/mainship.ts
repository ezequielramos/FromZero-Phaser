import Phaser from "phaser";
import mainShip from "../assets/mainship_t.png";
import laser from "../assets/simple_laser_shot_t.png";
import enemy from "../assets/mainship_t_o.png";
import spark from "../assets/explosion_t.png";

class Bullet extends Phaser.Physics.Arcade.Image {
    private speed: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = 300;
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        this.y -= this.speed * (delta / 1000);

        if (this.y < -50) {
            this.destroy();
        }
    }
}

class Enemy extends Phaser.Physics.Arcade.Image {
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

class Player extends Phaser.Physics.Arcade.Image {
    private speed: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = 300;
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        this.y -= this.speed * (delta / 1000);

        if (this.y < -50) {
            this.destroy();
        }
    }
}

class RectanglePool {
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

class VirtualJoystick {
    scene: Phaser.Scene;
    base: Phaser.GameObjects.Arc;
    thumb: Phaser.GameObjects.Arc;
    radius: number;
    pointerId: number | null = null;
    direction: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

    constructor(scene: Phaser.Scene, x: number, y: number, radius: number) {
        this.scene = scene;
        this.radius = radius;

        // base do joystick
        this.base = scene.add.circle(x, y, radius, 0x888888, 0.5);
        this.base.setScrollFactor(0);

        this.thumb = scene.add.circle(x, y, radius * 0.4, 0xffffff, 0.8);
        this.thumb.setScrollFactor(0);
        this.thumb.setInteractive({ draggable: true });

        scene.input.on('dragstart', (pointer: { id: number; }, gameObject: Phaser.GameObjects.Arc) => {
            if (gameObject === this.thumb) {
                this.pointerId = pointer.id;
            }
        });

        scene.input.on('drag', (pointer: { id: number; }, gameObject: Phaser.GameObjects.Arc, dragX: number, dragY: number) => {
            if (gameObject === this.thumb && this.pointerId === pointer.id) {
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
            if (gameObject === this.thumb && this.pointerId === pointer.id) {
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

export class MainShip extends Phaser.Scene {
    private ship!: Phaser.GameObjects.Image;
    // private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wKey?: Phaser.Input.Keyboard.Key;
    private aKey?: Phaser.Input.Keyboard.Key;
    private sKey?: Phaser.Input.Keyboard.Key;
    private dKey?: Phaser.Input.Keyboard.Key;
    private spaceKey?: Phaser.Input.Keyboard.Key;
    private speed: number = 200; // pixels por segundo
    private bullets!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;
    private numberOfEnemies = 1;
    private starsPool!: RectanglePool;
    private joystick!: VirtualJoystick;



    preload() {
        this.load.image("ship", mainShip);
        this.load.image("laser", laser);
        this.load.image("enemy", enemy);
        this.load.image("spark", spark);
    }

    create() {

        this.joystick = new VirtualJoystick(this, 100, this.scale.height - 100, 50);

        const fireButton = this.add.circle(this.scale.width - 80, this.scale.height - 80, 40, 0xff4444, 0.7);
        fireButton.setScrollFactor(0);
        fireButton.setInteractive({ useHandCursor: true });

        fireButton.on('pointerdown', () => {
            this.shoot();
        });


        this.starsPool = new RectanglePool(this, 100);
        for (let i = 0; i < 50; i++) {
            this.starsPool.spawn(Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, this.scale.height), Phaser.Math.Between(50, 200));
        }

        this.ship = new Player(this, 225, 600, 'ship');

        this.wKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.enemies = this.physics.add.group({
            classType: Enemy,
            runChildUpdate: true,
        });

        this.bullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
        });

        for (let i = 0; i < this.numberOfEnemies; i++) {
            this.enemies.create(150, -30, 'enemy');
        }

        this.physics.add.overlap(
            this.bullets,
            this.enemies,
            (bulletObj, enemyObj) => {

                const enemy = enemyObj as Enemy;

                this.add.particles(enemy.x, enemy.y, "spark", {
                    speed: { min: -200, max: 200 },
                    lifespan: 500,
                    quantity: 20,
                    scale: { start: 0.3, end: 0 },
                    blendMode: 'ADD',
                    duration: 200,
                });

                bulletObj.destroy();
                enemyObj.destroy();

            },
            undefined,
            this
        );

        this.physics.add.overlap(
            this.enemies,
            this.ship,
            (enemyObj, shipObj) => {

                const enemy = enemyObj as Enemy;

                this.add.particles(enemy.x, enemy.y, "spark", {
                    speed: { min: -200, max: 200 },
                    lifespan: 500,
                    quantity: 20,
                    scale: { start: 0.3, end: 0 },
                    blendMode: 'ADD',
                    duration: 200,
                });


                const player = shipObj as Player;

                this.add.particles(player.x, player.y, "spark", {
                    speed: { min: -200, max: 200 },
                    lifespan: 500,
                    quantity: 20,
                    scale: { start: 0.3, end: 0 },
                    blendMode: 'ADD',
                    duration: 200,
                });


                enemyObj.destroy();
                shipObj.destroy();

                this.time.delayedCall(1000, () => {
                    this.add.text(150, 300, "Game Over", {
                        fontSize: "24px",
                        color: "#ffffff"
                    });
                });
            },
            undefined,
            this
        );


    }

    shoot() {
        this.bullets.create(this.ship.x, this.ship.y, "laser");
    }

    update(_time: number, delta: number) {

        this.starsPool.update(delta, this.scale.height);

        if (Phaser.Math.Between(0, 10) > 8) {
            this.starsPool.spawn(Phaser.Math.Between(0, this.scale.width), 0, Phaser.Math.Between(50, 200));
        }

        const moveAmount = this.speed * (delta / 1000);

        if (this.enemies.getLength() === 0) {
            this.numberOfEnemies += 1;
            for (let i = 0; i < this.numberOfEnemies; i++) {
                const random = Phaser.Math.Between(0, 225);
                this.enemies.create(random, -30 - (i * 30), 'enemy');
            }
        }

        const dir = this.joystick.getDirection();
        this.ship.x += dir.x * this.speed * (delta / 1000);
        this.ship.y += dir.y * this.speed * (delta / 1000);


        if (this.wKey?.isDown) {
            this.ship.y -= moveAmount;
        }
        if (this.sKey?.isDown) {
            this.ship.y += moveAmount;
        }
        if (this.aKey?.isDown) {
            this.ship.x -= moveAmount;
        }
        if (this.dKey?.isDown) {
            this.ship.x += moveAmount;
        }
        if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.shoot();

        }

    }
}