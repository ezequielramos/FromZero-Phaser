import Phaser from "phaser";
import { MainShip } from "./objects/mainship";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/FromZero-Phaser/sw.js')
      .then(reg => console.log('Service Worker registrado', reg))
      .catch(err => console.error('Erro ao registrar SW', err));
  });
}

const backgroundColors = ['#030303', '#0a0a2a', '#1b0033'];

Math.floor(Math.random() * 3);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 430,
  height: 650,
  backgroundColor: backgroundColors[Math.floor(Math.random() * 3)],
  scene: [MainShip],
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