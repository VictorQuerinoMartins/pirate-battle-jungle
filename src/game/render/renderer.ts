import { Container, Graphics, Sprite, TilingSprite } from "pixi.js";
import type { Application, Texture } from "pixi.js";
import { gameConfig } from "../config/gameConfig";
import type { GameEvent, GameState } from "../core/game";
import { gridTile, sheetRegion } from "./atlas";
import { blobPoints } from "./islandShape";
import type { TextureMap } from "./atlas";
import { damageLevelFor, shipFrameName } from "./shipSprites";
import type { DamageLevel, ShipColor } from "./shipSprites";

const SHIP_SCALE = 0.65;
const SPRITE_ROTATION_OFFSET = -Math.PI / 2;

const WATER_TILE = 73;
const WAVE_ALPHA = 0.22;

const SAND_TILE = 68;
const SAND_EDGE_COLOR = 0xdba66b;
const GRASS_COLOR = 0x86b036;
const GRASS_EDGE_COLOR = 0x6f9a2c;
const GRASS_RATIO = 0.66;
const SHALLOW_COLOR = 0xb8efff;
const SHALLOW_BANDS = [
  { extra: 46, alpha: 0.18 },
  { extra: 22, alpha: 0.3 },
] as const;

const PLANT_SIZE = 64;
const PLANT_INSET = 1;
const PLANT_ARTS = [
  { x: 320, y: 256 },
  { x: 384, y: 256 },
  { x: 448, y: 256 },
] as const;
const PLANT_SPOTS = [
  { dx: -0.25, dy: -0.15, plant: 1 },
  { dx: 0.3, dy: 0.2, plant: 2 },
  { dx: 0.05, dy: 0.3, plant: 0 },
] as const;
const PROJECTILE_RADIUS = 4;
const PROJECTILE_COLOR = 0x2b2b2b;
const ENEMY_PROJECTILE_COLOR = 0xd9381e;
const HEALTH_BAR_WIDTH = 52;
const HEALTH_BAR_HEIGHT = 6;
const HEALTH_BAR_OFFSET = 44;
const HEALTH_BAR_BACK_COLOR = 0x3a3a3a;
const HEALTH_BAR_COLOR = 0x4ec24e;

const EXPLOSION_FRAMES = [
  "explosion_3.png",
  "explosion_2.png",
  "explosion_1.png",
] as const;
const SPARK_FRAMES = ["explosion_3.png"] as const;
const MAX_EFFECTS = 60;

interface Effect {
  sprite: Sprite;
  age: number;
  life: number;
  frames: readonly string[];
  fromScale: number;
  toScale: number;
}

export class Renderer {
  private readonly app: Application;
  private readonly textures: TextureMap;
  private readonly playerSprite: Sprite;
  private playerLevel: DamageLevel = 0;
  private readonly projectileGraphics = new Graphics();
  private readonly enemyLayer = new Container();
  private readonly enemySprites: Sprite[] = [];
  private readonly healthGraphics = new Graphics();
  private readonly effectLayer = new Container();
  private effects: Effect[] = [];
  private readonly water: TilingSprite;
  private readonly waves: TilingSprite;
  private waterTime = 0;

  constructor(
    app: Application,
    textures: TextureMap,
    tileSheet: Texture,
    state: GameState,
  ) {
    this.app = app;
    this.textures = textures;

    // Layer 1: the sea. A second, larger and fainter copy of the same tile
    // drifts the other way, so the water looks alive.
    const { width, height } = gameConfig.arena;
    const waterTexture = gridTile(tileSheet, WATER_TILE);
    this.water = new TilingSprite({ texture: waterTexture, width, height });
    this.waves = new TilingSprite({ texture: waterTexture, width, height });
    this.waves.tileScale.set(1.6);
    this.waves.alpha = WAVE_ALPHA;

    // Layer 2: the islands, built in layers and drawn inside the same circle
    // used for collision: shallow water (the sandbank), sand (a seamless tile
    // cut by the outline), the beach edge, grass and plants.
    const islands = new Container();
    const sandTexture = gridTile(tileSheet, SAND_TILE);

    const plantTextures = PLANT_ARTS.map((art) =>
      sheetRegion(
        tileSheet,
        art.x + PLANT_INSET,
        art.y + PLANT_INSET,
        PLANT_SIZE - 2 * PLANT_INSET,
        PLANT_SIZE - 2 * PLANT_INSET,
      ),
    );

    state.islands.forEach((island, index) => {
      const phase = index * 2.1;
      const outline = (radius: number) =>
        blobPoints(island.x, island.y, radius, phase);

      const shallow = new Graphics();
      for (const band of SHALLOW_BANDS) {
        shallow
          .poly(outline(island.radius + band.extra))
          .fill({ color: SHALLOW_COLOR, alpha: band.alpha });
      }

      const sand = new TilingSprite({
        texture: sandTexture,
        width: island.radius * 2,
        height: island.radius * 2,
      });
      sand.position.set(island.x - island.radius, island.y - island.radius);
      const sandMask = new Graphics()
        .poly(outline(island.radius))
        .fill(0xffffff);
      sand.mask = sandMask;

      const beach = new Graphics()
        .poly(outline(island.radius))
        .stroke({ color: SAND_EDGE_COLOR, width: 4 });
      const grass = new Graphics()
        .poly(outline(island.radius * GRASS_RATIO))
        .fill(GRASS_COLOR)
        .stroke({ color: GRASS_EDGE_COLOR, width: 3 });

      islands.addChild(shallow, sandMask, sand, beach, grass);

      for (const spot of PLANT_SPOTS) {
        const plant = new Sprite(plantTextures[spot.plant]);
        plant.anchor.set(0.5);
        plant.position.set(
          island.x + spot.dx * island.radius,
          island.y + spot.dy * island.radius,
        );
        plant.scale.set(island.radius / 110);
        islands.addChild(plant);
      }
    });

    // Layer 3: the player ship.
    this.playerSprite = new Sprite(this.shipTexture("red", 0));
    this.playerSprite.anchor.set(0.5);
    this.playerSprite.scale.set(SHIP_SCALE);

    app.stage.addChild(
      this.water,
      this.waves,
      islands,
      this.projectileGraphics,
      this.enemyLayer,
      this.playerSprite,
      this.effectLayer,
      this.healthGraphics,
    );
    this.render(state);
  }

  render(state: GameState, dt = 0): void {
    const { player } = state;

    // The sea drifts with the game time, so it freezes with the pause.
    this.waterTime += dt;
    this.water.tilePosition.set(this.waterTime * 8, this.waterTime * 3);
    this.waves.tilePosition.set(this.waterTime * -5, this.waterTime * 6);

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
    for (const projectile of state.enemyProjectiles) {
      this.projectileGraphics
        .circle(projectile.x, projectile.y, PROJECTILE_RADIUS)
        .fill(ENEMY_PROJECTILE_COLOR);
    }
    this.drawEnemies(state);
    this.spawnEffects(state.events);
    this.updateEffects(dt);

    this.healthGraphics.clear();
    this.drawHealthBar(player.x, player.y, player.hp, gameConfig.player.maxHp);
    for (const enemy of state.enemies) {
      this.drawHealthBar(
        enemy.x,
        enemy.y,
        enemy.hp,
        gameConfig[enemy.kind].maxHp,
      );
    }
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
      const color: ShipColor = enemy.kind === "shooter" ? "yellow" : "black";
      const level = damageLevelFor(enemy.hp, gameConfig[enemy.kind].maxHp);
      sprite.texture = this.shipTexture(color, level);
      sprite.position.set(enemy.x, enemy.y);
      sprite.rotation = enemy.angle + SPRITE_ROTATION_OFFSET;
    }
  }

  private drawHealthBar(x: number, y: number, hp: number, maxHp: number): void {
    const ratio = Math.max(0, hp) / maxHp;
    const left = x - HEALTH_BAR_WIDTH / 2;
    const top = y - HEALTH_BAR_OFFSET;

    this.healthGraphics
      .rect(left, top, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT)
      .fill(HEALTH_BAR_BACK_COLOR)
      .rect(left, top, HEALTH_BAR_WIDTH * ratio, HEALTH_BAR_HEIGHT)
      .fill(HEALTH_BAR_COLOR);
  }

  private spawnEffects(events: readonly GameEvent[]): void {
    for (const event of events) {
      switch (event.type) {
        case "shot":
          this.addEffect(
            event.x,
            event.y,
            SPARK_FRAMES,
            0.12,
            0.3,
            0.7,
            0xffe08a,
          );
          break;
        case "hit":
          this.addEffect(
            event.x,
            event.y,
            SPARK_FRAMES,
            0.18,
            0.4,
            0.8,
            0xff9a3c,
          );
          break;
        case "explosion":
          if (event.size === "large") {
            this.addEffect(event.x, event.y, EXPLOSION_FRAMES, 0.9, 1, 2.4);
          } else {
            this.addEffect(event.x, event.y, EXPLOSION_FRAMES, 0.5, 0.5, 1);
          }
          break;
      }
    }
  }

  private addEffect(
    x: number,
    y: number,
    frames: readonly string[],
    life: number,
    fromScale: number,
    toScale: number,
    tint = 0xffffff,
  ): void {
    if (this.effects.length >= MAX_EFFECTS) return;
    const sprite = new Sprite(this.effectTexture(frames[0]));
    sprite.anchor.set(0.5);
    sprite.position.set(x, y);
    sprite.tint = tint;
    this.effectLayer.addChild(sprite);
    this.effects.push({ sprite, age: 0, life, frames, fromScale, toScale });
  }

  // Moves every effect along its animation and removes the finished ones.
  private updateEffects(dt: number): void {
    for (const effect of this.effects) {
      effect.age += dt;
      const progress = Math.min(1, effect.age / effect.life);
      const frame =
        effect.frames[
          Math.min(
            effect.frames.length - 1,
            Math.floor(progress * effect.frames.length),
          )
        ];
      effect.sprite.texture = this.effectTexture(frame);
      effect.sprite.scale.set(
        effect.fromScale + (effect.toScale - effect.fromScale) * progress,
      );
      effect.sprite.alpha = progress < 0.6 ? 1 : 1 - (progress - 0.6) / 0.4;
    }
    this.effects = this.effects.filter((effect) => {
      if (effect.age < effect.life) return true;
      effect.sprite.destroy();
      return false;
    });
  }

  private effectTexture(name: string): Texture {
    const texture = this.textures.get(name);
    if (!texture) throw new Error(`Missing texture: ${name}`);
    return texture;
  }

  private shipTexture(color: ShipColor, level: DamageLevel): Texture {
    const name = shipFrameName(color, level);
    const texture = this.textures.get(name);
    if (!texture) throw new Error(`Missing texture: ${name}`);
    return texture;
  }
}
