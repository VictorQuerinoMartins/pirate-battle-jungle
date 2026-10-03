import { Container, Graphics, Sprite, Texture, TilingSprite } from "pixi.js";
import type { Application } from "pixi.js";
import { gameConfig } from "../config/gameConfig";
import type { GameEvent, GameState, ProjectileState } from "../core/game";
import type { Rect } from "../core/geometry";
import { gridTile, sheetRegion } from "./atlas";
import type { TextureMap } from "./atlas";
import { createRandom, makeDebris } from "./debris";
import type { DebrisPiece, DebrisSize } from "./debris";
import { ISLAND_ART } from "./islandArt";
import { wobblyRectPoints } from "./landShape";
import { damageLevelFor, shipFrameName } from "./shipSprites";
import type { DamageLevel, ShipColor } from "./shipSprites";
import { trailSegments } from "./trail";

const SHIP_SCALE = 0.65;
const SPRITE_ROTATION_OFFSET = -Math.PI / 2;

const WATER_TILE = 73;
const WAVE_ALPHA = 0.22;

// Island look. SAND_TILE is a seamless sand tile of tiles_sheet.png (64 px).
const SAND_TILE = 68;
const SAND_EDGE_COLOR = 0xdba66b;
const GRASS_COLOR = 0x86b036;
const GRASS_EDGE_COLOR = 0x6f9a2c;
const SHALLOW_COLOR = 0xb8efff;
const SHALLOW_BANDS = [
  { extra: 46, alpha: 0.18 },
  { extra: 22, alpha: 0.3 },
] as const;
const CORNER_RADIUS = 30; // round corners of the drawn land (not of collision)
const GRASS_CORNER = 22;
// How far the drawn edges move in and out (pixels). Collision ignores it.
const SAND_WOBBLE = 7;
const SHALLOW_WOBBLE = 10;
const GRASS_WOBBLE = 6;
const BEACH_EDGE = 4; // width of the darker edge around the sand
const GRASS_EDGE = 3;

// Regions of tiles_sheet.png (64 px tiles): three plants.
const PLANT_SIZE = 64;
const PLANT_INSET = 1;
const PLANT_ARTS = [
  { x: 320, y: 256 },
  { x: 384, y: 256 },
  { x: 448, y: 256 },
] as const;

// Rocks (plain and mossy) and tiny leaves use tiles of tiles_sheet.png; their
// places are in islandArt.ts.
const TILES_PER_ROW = 16;
const TILE_SIZE = 64;

// The fort: a 3x3 block of tiles (corner towers, walls and an empty courtyard
// marked 0) with a cannon in the middle.
const FORT_LAYOUT = [
  [77, 16, 78],
  [15, 0, 15],
  [93, 16, 94],
] as const;
const FORT_TILE_SCALE = 0.75;
const FORT_TILE = TILE_SIZE * FORT_TILE_SCALE;
const FORT_CANNON_SCALE = 1.2;
const FORT_SLEEP_TINT = 0x8a8a8a; // the cannon is dark until the fort wakes up

const PROJECTILE_RADIUS = 4;
const PROJECTILE_COLOR = 0x2b2b2b;
const ENEMY_PROJECTILE_COLOR = 0xd9381e;
const PLAYER_TRAIL_COLOR = 0xffffff;
const ENEMY_TRAIL_COLOR = 0xffb199;
const TRAIL_ALPHA = 0.6;

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
const MAX_DEBRIS = 80;
const DEBRIS_DRAG = 2.2; // how fast the pieces slow down

// The smallest rectangle that holds all the rectangles of an island.
function islandBounds(rects: readonly Rect[]): Rect {
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

interface Effect {
  sprite: Sprite;
  age: number;
  life: number;
  frames: readonly string[];
  fromScale: number;
  toScale: number;
}

interface Debris {
  sprite: Sprite;
  piece: DebrisPiece;
  age: number;
  vx: number;
  vy: number;
  spin: number;
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
  private readonly debrisLayer = new Container();
  private debris: Debris[] = [];
  private readonly random = createRandom(2026);
  private readonly water: TilingSprite;
  private readonly waves: TilingSprite;
  private waterTime = 0;
  private readonly fortCannon: Sprite;

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

    // Layer 2: the islands. Each one is a union of rectangles, drawn in layers:
    // shallow water (the sandbank), sand, a beach edge, grass, plants, rocks
    // and leaves. The shallow water and the sand use masks, so places where two
    // rectangles overlap are not drawn twice.
    const islands = new Container();
    const sandTexture = gridTile(tileSheet, SAND_TILE);

    // One pixel is cut from each side: the plants only have empty pixels
    // there, and it stops the filter from mixing in the neighbouring tile.
    const plantTextures = PLANT_ARTS.map((art) =>
      sheetRegion(
        tileSheet,
        art.x + PLANT_INSET,
        art.y + PLANT_INSET,
        PLANT_SIZE - 2 * PLANT_INSET,
        PLANT_SIZE - 2 * PLANT_INSET,
      ),
    );

    // Same one-pixel cut for the rocks and leaves, picked by tile number.
    const decorTextures = new Map<number, Texture>();
    const decorTexture = (tile: number): Texture => {
      let texture = decorTextures.get(tile);
      if (!texture) {
        const index = tile - 1;
        texture = sheetRegion(
          tileSheet,
          (index % TILES_PER_ROW) * TILE_SIZE + 1,
          Math.floor(index / TILES_PER_ROW) * TILE_SIZE + 1,
          TILE_SIZE - 2,
          TILE_SIZE - 2,
        );
        decorTextures.set(tile, texture);
      }
      return texture;
    };

    // Draws a wobbly outline for every rectangle, grown by `grow` pixels.
    // `phase` makes each island and each rectangle wobble in its own way.
    const drawBlobs = (
      graphics: Graphics,
      rects: readonly Rect[],
      grow: number,
      phase: number,
      amplitude: number,
      corner = CORNER_RADIUS,
    ): Graphics => {
      rects.forEach((rect, i) => {
        graphics.poly(
          wobblyRectPoints(rect, grow, {
            corner,
            phase: phase + i * 2.3,
            amplitude,
          }),
        );
      });
      return graphics;
    };

    state.islands.forEach((island, index) => {
      const art = ISLAND_ART[index % ISLAND_ART.length];
      const phase = index * 2.1 + 0.7;
      const bounds = islandBounds(island.rects);

      for (const band of SHALLOW_BANDS) {
        const water = new Sprite(Texture.WHITE);
        water.tint = SHALLOW_COLOR;
        water.alpha = band.alpha;
        water.position.set(bounds.x - band.extra, bounds.y - band.extra);
        water.width = bounds.width + 2 * band.extra;
        water.height = bounds.height + 2 * band.extra;
        const mask = drawBlobs(
          new Graphics(),
          island.rects,
          band.extra,
          phase + band.extra,
          SHALLOW_WOBBLE,
        ).fill(0xffffff);
        water.mask = mask;
        islands.addChild(mask, water);
      }

      // The beach edge is the sand rectangles grown by a few pixels, in a
      // darker color, with the sand drawn over them.
      const beach = drawBlobs(
        new Graphics(),
        island.rects,
        BEACH_EDGE,
        phase,
        SAND_WOBBLE,
      ).fill(SAND_EDGE_COLOR);
      const sand = new TilingSprite({
        texture: sandTexture,
        width: bounds.width,
        height: bounds.height,
      });
      sand.position.set(bounds.x, bounds.y);
      const sandMask = drawBlobs(
        new Graphics(),
        island.rects,
        0,
        phase,
        SAND_WOBBLE,
      ).fill(0xffffff);
      sand.mask = sandMask;
      islands.addChild(beach, sandMask, sand);

      const grassEdge = drawBlobs(
        new Graphics(),
        art.grass,
        GRASS_EDGE,
        phase + 1,
        GRASS_WOBBLE,
        GRASS_CORNER,
      ).fill(GRASS_EDGE_COLOR);
      const grass = drawBlobs(
        new Graphics(),
        art.grass,
        0,
        phase + 1,
        GRASS_WOBBLE,
        GRASS_CORNER,
      ).fill(GRASS_COLOR);
      islands.addChild(grassEdge, grass);

      for (const spot of art.plants) {
        const plant = new Sprite(plantTextures[spot.plant]);
        plant.anchor.set(0.5);
        plant.position.set(spot.x, spot.y);
        plant.scale.set(spot.scale);
        islands.addChild(plant);
      }

      for (const spot of art.decor) {
        const decor = new Sprite(decorTexture(spot.tile));
        decor.anchor.set(0.5);
        decor.position.set(spot.x, spot.y);
        decor.scale.set(spot.scale);
        decor.rotation = spot.rotation;
        islands.addChild(decor);
      }
    });

    // The fort stands on one of the islands. The cannon turns toward the
    // player in `render`.
    const { fort } = state;
    FORT_LAYOUT.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        if (tile === 0) return;
        const piece = new Sprite(gridTile(tileSheet, tile));
        piece.anchor.set(0.5);
        piece.scale.set(FORT_TILE_SCALE);
        piece.position.set(
          fort.x + (colIndex - 1) * FORT_TILE,
          fort.y + (rowIndex - 1) * FORT_TILE,
        );
        islands.addChild(piece);
      });
    });
    this.fortCannon = new Sprite(this.effectTexture("cannon_mobile.png"));
    this.fortCannon.anchor.set(0.5);
    this.fortCannon.scale.set(FORT_CANNON_SCALE);
    this.fortCannon.position.set(fort.x, fort.y);
    islands.addChild(this.fortCannon);

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
      this.debrisLayer,
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

    this.fortCannon.rotation = state.fort.angle;
    this.fortCannon.tint = state.fort.active ? 0xffffff : FORT_SLEEP_TINT;

    this.projectileGraphics.clear();
    for (const projectile of state.projectiles) {
      this.drawTrail(projectile, PLAYER_TRAIL_COLOR);
      this.projectileGraphics
        .circle(projectile.x, projectile.y, PROJECTILE_RADIUS)
        .fill(PROJECTILE_COLOR);
    }
    for (const projectile of state.enemyProjectiles) {
      this.drawTrail(projectile, ENEMY_TRAIL_COLOR);
      this.projectileGraphics
        .circle(projectile.x, projectile.y, PROJECTILE_RADIUS)
        .fill(ENEMY_PROJECTILE_COLOR);
    }

    this.drawEnemies(state);
    this.spawnEffects(state.events);
    this.updateEffects(dt);
    this.updateDebris(dt);

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

  // The tail of a shot: segments behind it, thinner and fainter toward the end.
  private drawTrail(projectile: ProjectileState, color: number): void {
    for (const segment of trailSegments(
      projectile.x,
      projectile.y,
      projectile.vx,
      projectile.vy,
    )) {
      this.projectileGraphics
        .moveTo(segment.x1, segment.y1)
        .lineTo(segment.x2, segment.y2)
        .stroke({
          width: segment.width,
          color,
          alpha: segment.alpha * TRAIL_ALPHA,
          cap: "round",
        });
    }
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
          this.addDebris(event.x, event.y, event.size);
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

  private addDebris(x: number, y: number, size: DebrisSize): void {
    for (const piece of makeDebris(size, this.random)) {
      if (this.debris.length >= MAX_DEBRIS) return;
      const sprite = new Sprite(this.effectTexture(piece.frame));
      sprite.anchor.set(0.5);
      sprite.position.set(x, y);
      sprite.scale.set(piece.scale);
      sprite.rotation = this.random() * Math.PI * 2;
      this.debrisLayer.addChild(sprite);
      this.debris.push({
        sprite,
        piece,
        age: 0,
        vx: Math.cos(piece.angle) * piece.speed,
        vy: Math.sin(piece.angle) * piece.speed,
        spin: piece.spin,
      });
    }
  }

  // Pieces fly out, slow down, spin less and less, then fade away.
  private updateDebris(dt: number): void {
    const drag = Math.exp(-DEBRIS_DRAG * dt);
    for (const item of this.debris) {
      item.age += dt;
      item.vx *= drag;
      item.vy *= drag;
      item.spin *= drag;
      item.sprite.x += item.vx * dt;
      item.sprite.y += item.vy * dt;
      item.sprite.rotation += item.spin * dt;
      const progress = item.age / item.piece.life;
      item.sprite.alpha =
        progress < 0.5 ? 1 : Math.max(0, 1 - (progress - 0.5) / 0.5);
    }
    this.debris = this.debris.filter((item) => {
      if (item.age < item.piece.life) return true;
      item.sprite.destroy();
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
