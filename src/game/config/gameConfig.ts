import type { Circle } from "../core/geometry";
export interface GameConfig {
  readonly arena: {
    readonly width: number;
    readonly height: number;
    readonly islands: readonly Circle[];
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
    readonly maxAttempts: number;
  };

  readonly fort: {
    readonly islandIndex: number; // which island the fort stands on
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
    islands: [
      { x: 300, y: 200, radius: 118 },
      { x: 900, y: 260, radius: 143 },
      { x: 640, y: 560, radius: 104 },
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
    maxAttempts: 10,
  },

  fort: {
    islandIndex: 0,
    unlockScore: 5,
    range: 460,
    fireCooldownMs: 3000,
    projectileSpeed: 300,
    shotDamage: 8,
    muzzleLength: 26,
  },
};
