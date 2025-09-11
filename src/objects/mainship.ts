import Phaser from "phaser";
import mainShip from "../assets/mainship_t.png";
import laser from "../assets/simple_laser_shot_t.png";
import enemy from "../assets/mainship_t_o.png";
import spark from "../assets/explosion_t.png";
import { Bullet } from "./bullet";
import { Enemy } from "./enemy";
import { Player } from "./player";
import { StarsPool } from "./stars-pool";
import { VirtualJoystick } from "./virtual-joystick";

export class MainShip extends Phaser.Scene {
    private ship!: Phaser.GameObjects.Image;
    private wKey?: Phaser.Input.Keyboard.Key;
    private aKey?: Phaser.Input.Keyboard.Key;
    private sKey?: Phaser.Input.Keyboard.Key;
    private dKey?: Phaser.Input.Keyboard.Key;
    private spaceKey?: Phaser.Input.Keyboard.Key;
    private speed: number = 200;
    private bullets!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;
    private numberOfEnemies = 1;
    private starsPool!: StarsPool;
    private joystick!: VirtualJoystick;
    private gameOver = false;
    private gameOverText?: Phaser.GameObjects.Text;
    private gameOver2Text?: Phaser.GameObjects.Text;

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


        this.starsPool = new StarsPool(this, 100);
        for (let i = 0; i < 50; i++) {
            this.starsPool.spawn(Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, this.scale.height), Phaser.Math.Between(50, 200));
        }

        this.wKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.enemies = this.physics.add.group({
            classType: Enemy,
            runChildUpdate: true,
        });

        this.startPlayer(this.enemies);

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

    }

    startPlayer(enemies: Phaser.Physics.Arcade.Group) {
        this.ship = new Player(this, 225, 600, 'ship');

        this.physics.add.overlap(
            enemies,
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
                    this.gameOverText = this.add.text(150, 300, "Game Over", {
                        fontSize: "24px",
                        color: "#ffffff",
                    });
                });

                this.time.delayedCall(1500, () => {
                    this.gameOver2Text = this.add.text(139, 350, "Touch to restart", {
                        fontSize: "16px",
                        color: "#ffffff",
                        align: 'center'
                    });
                    this.gameOver = true;
                });
            },
            undefined,
            this
        );
    }

    shoot() {
        if (this.ship.active) {
            this.bullets.create(this.ship.x, this.ship.y, "laser");
        }
        if (this.gameOver) {
            this.gameOver = false;
            this.numberOfEnemies = 0;
            this.startPlayer(this.enemies);

            this.enemies.clear(true, true);

            this.gameOverText?.destroy();
            this.gameOver2Text?.destroy();
        }
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
                const random = Phaser.Math.Between(0, 450);
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

        if (this.ship.y > 800 - (this.ship.height / 2)) {
            this.ship.y = 800 - (this.ship.height / 2);
        } else if (this.ship.y < (this.ship.height / 2)) {
            this.ship.y = (this.ship.height / 2);
        }

        if (this.ship.x > 450 - (this.ship.width / 2)) {
            this.ship.x = 450 - (this.ship.width / 2);
        } else if (this.ship.x < (this.ship.width / 2)) {
            this.ship.x = (this.ship.width / 2);
        }


    }
}