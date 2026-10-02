import { Container, Graphics, Sprite, TilingSprite } from "pixi.js";
import type { Application, Texture } from "pixi.js";
import { gameConfig } from "../config/gameConfig";
import type { GameState } from "../core/game";
import { gridTile } from "./atlas";
import type { TextureMap } from "./atlas";
import { damageLevelFor, shipFrameName } from "./shipSprites";
import type { DamageLevel, ShipColor } from "./shipSprites";

const SHIP_SCALE = 0.5;
const SPRITE_ROTATION_OFFSET = -Math.PI / 2;

const WATER_TILE = 73;
const SAND_COLOR = 0xf9d49d;
const GRASS_COLOR = 0x89b738;
const SHALLOW_COLOR = 0xb8efff;
const SHALLOW_WIDTH = 14;
const PROJECTILE_RADIUS = 4;
const PROJECTILE_COLOR = 0x2b2b2b;

export class Renderer {
  private readonly app: Application;
  private readonly textures: TextureMap;
  private readonly playerSprite: Sprite;
  private playerLevel: DamageLevel = 0;
  private readonly projectileGraphics = new Graphics();
  private readonly enemyLayer = new Container();
  private readonly enemySprites: Sprite[] = [];

  constructor(
    app: Application,
    textures: TextureMap,
    tileSheet: Texture,
    state: GameState,
  ) {
    this.app = app;
    this.textures = textures;

    // Layer 1: the sea, one tile repeated over the whole arena.
    const water = new TilingSprite({
      texture: gridTile(tileSheet, WATER_TILE),
      width: gameConfig.arena.width,
      height: gameConfig.arena.height,
    });

    // Layer 2: the islands, drawn with the same circles used for collision.
    const islands = new Graphics();
    for (const island of state.islands) {
      islands
        .circle(island.x, island.y, island.radius + SHALLOW_WIDTH)
        .fill({ color: SHALLOW_COLOR, alpha: 0.4 });
      islands.circle(island.x, island.y, island.radius).fill(SAND_COLOR);
      islands.circle(island.x, island.y, island.radius * 0.7).fill(GRASS_COLOR);
    }

    // Layer 3: the player ship.
    this.playerSprite = new Sprite(this.shipTexture("red", 0));
    this.playerSprite.anchor.set(0.5);
    this.playerSprite.scale.set(SHIP_SCALE);

    app.stage.addChild(
      water,
      islands,
      this.projectileGraphics,
      this.enemyLayer,
      this.playerSprite,
    );
    this.render(state);
  }

  render(state: GameState): void {
    const { player } = state;

    const level = damageLevelFor(player.hp, gameConfig.player.maxHp);
    if (level !== this.playerLevel) {
      this.playerLevel = level;
      this.playerSprite.texture = this.shipTexture("red", level);
    }

    this.playerSprite.position.set(player.x, player.y);

    this.playerSprite.rotation = player.angle + SPRITE_ROTATION_OFFSET;
    this.projectileGraphics.clear();
    for (const projectile of state.projectiles) {
      this.projectileGraphics
        .circle(projectile.x, projectile.y, PROJECTILE_RADIUS)
        .fill(PROJECTILE_COLOR);
    }
    this.drawEnemies(state);
    this.app.render();
  }

  private drawEnemies(state: GameState): void {
    while (this.enemySprites.length < state.enemies.length) {
      const sprite = new Sprite(this.shipTexture("black", 0));
      sprite.anchor.set(0.5);
      sprite.scale.set(SHIP_SCALE);
      this.enemyLayer.addChild(sprite);
      this.enemySprites.push(sprite);
    }
    while (this.enemySprites.length > state.enemies.length) {
      this.enemySprites.pop()?.destroy();
    }

    for (let i = 0; i < state.enemies.length; i++) {
      const enemy = state.enemies[i];
      const sprite = this.enemySprites[i];
      const level = damageLevelFor(enemy.hp, gameConfig.chaser.maxHp);
      sprite.texture = this.shipTexture("black", level);
      sprite.position.set(enemy.x, enemy.y);
      sprite.rotation = enemy.angle + SPRITE_ROTATION_OFFSET;
    }
  }

  private shipTexture(color: ShipColor, level: DamageLevel): Texture {
    const name = shipFrameName(color, level);
    const texture = this.textures.get(name);
    if (!texture) throw new Error(`Missing texture: ${name}`);
    return texture;
  }
}
