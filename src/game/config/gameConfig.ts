import type { Island } from "../core/geometry";
export interface GameConfig {
  readonly arena: {
    readonly width: number;
    readonly height: number;
    readonly islands: readonly Island[];
  };

  readonly match: {
    readonly durationSeconds: number;
    readonly scorePerKill: number;
  };

  readonly player: {
    readonly maxHp: number;
    readonly speed: number;
    readonly fireCooldownMs: number;
    readonly broadsideCooldownMs: number;
    readonly broadsideProjectiles: number;
    readonly broadsideSpacing: number;
    readonly rotationSpeed: number;
    readonly radius: number;
  };
  readonly projectile: {
    readonly speed: number;
    readonly damage: number;
    readonly lifetimeMs: number;
  };
  readonly chaser: {
    readonly maxHp: number;
    readonly speed: number;
    readonly contactDamage: number;
    readonly radius: number;
  };
  readonly shooter: {
    readonly maxHp: number;
    readonly speed: number;
    readonly contactDamage: number;
    readonly radius: number;
    readonly fireCooldownMs: number;
    readonly range: number;
    readonly shotDamage: number;
  };
  readonly spawn: {
    readonly intervalMs: number;
    readonly maxEnemies: number;
    readonly minDistanceFromPlayer: number;
    readonly minDistanceFromIslands: number; // free water around the new ship
    readonly maxAttempts: number;
  };

  readonly fort: {
    readonly islandIndex: number; // which island the fort stands on
    readonly x: number; // center of the fort
    readonly y: number;
    readonly unlockScore: number;
    readonly range: number;
    readonly fireCooldownMs: number;
    readonly projectileSpeed: number;
    readonly shotDamage: number;
    readonly muzzleLength: number;
  };
}

export const gameConfig: GameConfig = {
  arena: {
    width: 1280,
    height: 720,
    // Blocks of land, each one surrounded by water. An L shape is two
    // rectangles that touch.
    islands: [
      { rects: [{ x: 90, y: 60, width: 320, height: 240 }] },
      {
        rects: [
          { x: 880, y: 140, width: 300, height: 130 },
          { x: 1000, y: 250, width: 180, height: 140 },
        ],
      },
      { rects: [{ x: 460, y: 500, width: 320, height: 170 }] },
    ],
  },
  match: { durationSeconds: 120, scorePerKill: 1 },
  player: {
    maxHp: 100,
    speed: 220,
    rotationSpeed: 3,
    radius: 26,
    fireCooldownMs: 400,
    broadsideCooldownMs: 1000,
    broadsideProjectiles: 3,
    broadsideSpacing: 18,
  },
  projectile: { speed: 500, damage: 10, lifetimeMs: 1500 },
  chaser: { maxHp: 30, speed: 110, contactDamage: 10, radius: 20 },
  shooter: {
    maxHp: 20,
    speed: 80,
    contactDamage: 10,
    radius: 26,
    fireCooldownMs: 1500,
    range: 320,
    shotDamage: 5,
  },
  spawn: {
    intervalMs: 3000,
    maxEnemies: 8,
    minDistanceFromPlayer: 300,
    minDistanceFromIslands: 70,
    maxAttempts: 10,
  },

  fort: {
    islandIndex: 0,
    x: 210,
    y: 180,
    unlockScore: 5,
    range: 460,
    fireCooldownMs: 3000,
    projectileSpeed: 300,
    shotDamage: 8,
    muzzleLength: 26,
  },
};
