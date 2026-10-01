import type { Application, Sprite as PixiSprite, Texture } from 'pixi.js';
import { Sprite } from 'pixi.js';
import { gameConfig } from '../config/gameConfig';
import type { GameState } from '../core/game';
import type { TextureMap } from './atlas';
import { damageLevelFor, shipFrameName } from './shipSprites';
import type { DamageLevel } from './shipSprites';

const SHIP_SCALE = 0.5;
const SPRITE_ROTATION_OFFSET = -Math.PI / 2;

export class Renderer {
  private readonly app: Application;
  private readonly textures: TextureMap;
  private readonly playerSprite: PixiSprite;
  private playerLevel: DamageLevel = 0;

  constructor(app: Application, textures: TextureMap, state: GameState) {
    this.app = app;
    this.textures = textures;

    this.playerSprite = new Sprite(this.shipTexture(0));
    this.playerSprite.anchor.set(0.5);
    this.playerSprite.scale.set(SHIP_SCALE);
    app.stage.addChild(this.playerSprite);

    this.render(state);
  }

  render(state: GameState): void {
    const { player } = state;

    const level = damageLevelFor(player.hp, gameConfig.player.maxHp);
    if (level !== this.playerLevel) {
      this.playerLevel = level;
      this.playerSprite.texture = this.shipTexture(level);
    }

    this.playerSprite.position.set(player.x, player.y);
    this.playerSprite.rotation = player.angle + SPRITE_ROTATION_OFFSET;

    this.app.render();
  }

  private shipTexture(level: DamageLevel): Texture {
    const name = shipFrameName('red', level);
    const texture = this.textures.get(name);
    if (!texture) throw new Error(`Missing texture: ${name}`);
    return texture;
  }
}