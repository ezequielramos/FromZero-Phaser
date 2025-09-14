import { Bullet } from "./bullet";
import { Textures } from "./textures";
import { VirtualJoystick } from "./virtual-joystick";

export class Player extends Phaser.Physics.Arcade.Image {
    private wKey?: Phaser.Input.Keyboard.Key;
    private aKey?: Phaser.Input.Keyboard.Key;
    private sKey?: Phaser.Input.Keyboard.Key;
    private dKey?: Phaser.Input.Keyboard.Key;
    private spaceKey?: Phaser.Input.Keyboard.Key;
    private speed = 200;
    private bullets!: Phaser.Physics.Arcade.Group;
    private enemies: Phaser.Physics.Arcade.Group[];
    private gameOver = false;
    private gameOverText?: Phaser.GameObjects.Text;
    private gameOver2Text?: Phaser.GameObjects.Text;
    private restartGameCallback: () => void;
    private joystick: VirtualJoystick;

    constructor(scene: Phaser.Scene, x: number, y: number, enemies: Phaser.Physics.Arcade.Group[], restartGameCallback: () => void) {
        super(scene, x, y, Textures.get('ship'));
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.joystick = new VirtualJoystick(scene, 100, this.scene.scale.height - 100, 50);

        const fireButton = scene.add.circle(this.scene.scale.width - 80, this.scene.scale.height - 80, 40, 0xff4444, 0.7);
        fireButton.setInteractive({ useHandCursor: true });
        fireButton.on('pointerdown', () => {
            this.shoot();
        });

        this.wKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.restartGameCallback = restartGameCallback;

        this.bullets = scene.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
        });

        this.enemies = enemies;


        scene.physics.add.overlap(
            this.bullets,
            this.enemies,
            (bulletObj, enemyObj) => {

                const enemy = enemyObj as Phaser.Physics.Arcade.Image;

                scene.add.particles(enemy.x, enemy.y, Textures.get('spark'), {
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


        scene.physics.add.overlap(
            enemies,
            this,
            (enemyObj) => {

                const enemy = enemyObj as Phaser.Physics.Arcade.Image;

                scene.add.particles(enemy.x, enemy.y, Textures.get('spark'), {
                    speed: { min: -200, max: 200 },
                    lifespan: 500,
                    quantity: 20,
                    scale: { start: 0.3, end: 0 },
                    blendMode: 'ADD',
                    duration: 200,
                });


                scene.add.particles(this.x, this.y, Textures.get('spark'), {
                    speed: { min: -200, max: 200 },
                    lifespan: 500,
                    quantity: 20,
                    scale: { start: 0.3, end: 0 },
                    blendMode: 'ADD',
                    duration: 200,
                });


                enemyObj.destroy();
                this.destroy();

                scene.time.delayedCall(1000, () => {
                    this.gameOverText = scene.add.text(150, 300, "Game Over", {
                        fontSize: "24px",
                        color: "#ffffff",
                    });
                });

                scene.time.delayedCall(1500, () => {
                    this.gameOver2Text = scene.add.text(139, 350, "Touch to restart", {
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
        if (this.active) {
            this.bullets.create(this.x, this.y, Textures.get('laser'));
        }
        if (this.gameOver) {
            this.gameOver = false;

            for (const enemyGroup of this.enemies) {
                enemyGroup.clear(true, true);
            }

            this.restartGameCallback();

            this.gameOverText?.destroy();
            this.gameOver2Text?.destroy();
        }
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        const moveAmount = this.speed * (delta / 1000);

        const dir = this.joystick.getDirection();
        this.x += dir.x * this.speed * (delta / 1000);
        this.y += dir.y * this.speed * (delta / 1000);

        if (dir.x === 0 || dir.y === 0) {
            if (this.wKey?.isDown) {
                this.y -= moveAmount;
            }
            if (this.sKey?.isDown) {
                this.y += moveAmount;
            }
            if (this.aKey?.isDown) {
                this.x -= moveAmount;
            }
            if (this.dKey?.isDown) {
                this.x += moveAmount;
            }
        }

        if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.shoot();
        }

        if (this.y > 800 - (this.height / 2)) {
            this.y = 800 - (this.height / 2);
        } else if (this.y < (this.height / 2)) {
            this.y = (this.height / 2);
        }

        if (this.x > 450 - (this.width / 2)) {
            this.x = 450 - (this.width / 2);
        } else if (this.x < (this.width / 2)) {
            this.x = (this.width / 2);
        }
    }
}
