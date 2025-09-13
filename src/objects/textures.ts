import pursuer from "../assets/pursuer.png";
import mainShip from "../assets/mainship_t.png";
import laser from "../assets/simple_laser_shot_t.png";
import enemy from "../assets/mainship_t_o.png";
import spark from "../assets/explosion_t.png";

const textures = {
    'pursuer': pursuer,
    'ship': mainShip,
    'laser': laser,
    'boomerang': enemy,
    'spark': spark,
};

export class Textures {

    static get(texture: keyof typeof textures) {
        return texture;
    }

    static load(scene: Phaser.Scene, texture: keyof typeof textures) {
        scene.load.image(texture, textures[texture]);
    }
}

export namespace Textures {
    export type key = keyof typeof textures;
}