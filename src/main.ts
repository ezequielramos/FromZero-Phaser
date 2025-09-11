import Phaser from "phaser";
import { MainShip } from "./objects/mainship";

const backgroundColors = ['#030303', '#0a0a2a', '#1b0033'];

Math.floor(Math.random() * 3);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 430,
  height: 650,
  backgroundColor: backgroundColors[Math.floor(Math.random() * 3)],
  scene: [MainShip],
  scale: {
    mode: Phaser.Scale.FIT,       // escala o jogo para caber na tela mantendo proporção
    autoCenter: Phaser.Scale.CENTER_BOTH, // centraliza o jogo na tela
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    }
  }
};

new Phaser.Game(config);