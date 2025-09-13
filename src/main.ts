import Phaser from "phaser";
import { MainScene } from "./objects/main-scene";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/FromZero-Phaser/sw.js')
      .catch(err => console.error('error on registering SW', err));
  });
}

const backgroundColors = ['#030303', '#0a0a2a', '#1b0033'];

Math.floor(Math.random() * 3);

const height = 800;
const width = height * 9 / 16;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: width,
  height: height,
  backgroundColor: backgroundColors[Math.floor(Math.random() * 3)],
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    }
  },
  input: {
    activePointers: 3
  },
};

new Phaser.Game(config);