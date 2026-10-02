import type { Circle } from '../core/geometry';
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
    readonly rotationSpeed: number;
    readonly radius: number
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
    readonly fireCooldownMs: number;
  };
  readonly spawn: {
    readonly intervalMs: number;
    readonly maxEnemies: number;
  };
}

export const gameConfig: GameConfig = {
    arena: {
    width: 1280,
    height: 720,
    islands: [
      { x: 300, y: 200, radius: 90 },
      { x: 900, y: 260, radius: 110 },
      { x: 640, y: 560, radius: 80 },
    ],
  },
    match: { durationSeconds: 120, scorePerKill: 100 },
  player: { maxHp: 100, speed: 220, rotationSpeed: 3, radius: 20, fireCooldownMs: 400 },
  projectile: { speed: 500, damage: 10, lifetimeMs: 1500 },
  chaser: { maxHp: 30, speed: 110, contactDamage: 10, radius: 20 },
  shooter: { maxHp: 20, speed: 80, fireCooldownMs: 1500 },
  spawn: { intervalMs: 2000, maxEnemies: 8 },
};
