export interface GameConfig {
  readonly arena: { readonly width: number; readonly height: number };
  readonly match: { readonly durationSeconds: number };

  readonly player: {
    readonly maxHp: number;
    readonly speed: number;
    readonly fireCooldownMs: number;
    readonly rotationSpeed: number;
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
  arena: { width: 1280, height: 720 },
  match: { durationSeconds: 120 },
  player: { maxHp: 100, speed: 220, rotationSpeed: 3, fireCooldownMs: 400 },
  projectile: { speed: 500, damage: 10, lifetimeMs: 1500 },
  chaser: { maxHp: 30, speed: 110, contactDamage: 10 },
  shooter: { maxHp: 20, speed: 80, fireCooldownMs: 1500 },
  spawn: { intervalMs: 2000, maxEnemies: 8 },
};
