import { gameConfig } from "../config/gameConfig";
import type { Action, GameInput } from "../input/gameInput";
import {
  circlesOverlap,
  pushOutOfCircle,
  type Circle,
  type Point,
} from "./geometry";
import { createRng } from "./rng";
import { defaultOptions, type GameOptions } from "./options";

export type Weapon = "front" | "left" | "right";

const SHOTS: readonly {
  weapon: Weapon;
  action: Action;
  angleOffset: number;
}[] = [
  { weapon: "front", action: "fireFront", angleOffset: 0 },
  { weapon: "left", action: "fireLeft", angleOffset: -Math.PI / 2 },
  { weapon: "right", action: "fireRight", angleOffset: Math.PI / 2 },
];

export interface ProjectileState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  timeLeft: number;
}

export interface PlayerState {
  x: number;
  y: number;
  angle: number;
  hp: number;
  cooldowns: Record<Weapon, number>;
}

export type EnemyKind = "chaser" | "shooter";

export interface EnemyState {
  kind: EnemyKind;
  x: number;
  y: number;
  angle: number;
  hp: number;
  cooldown: number; // seconds until the next shot (only shooters use it)
}

export type GameStatus = "playing" | "over";
export type GameEvent =
  | { type: "shot"; x: number; y: number }
  | { type: "hit"; x: number; y: number }
  | { type: "explosion"; x: number; y: number; size: "small" | "large" };

export interface GameState {
  player: PlayerState;
  islands: readonly Circle[];
  projectiles: ProjectileState[]; // fired by the player
  enemyProjectiles: ProjectileState[]; // fired by shooters
  enemies: EnemyState[];
  spawnTimer: number;
  spawnInterval: number;
  random: () => number;
  score: number;
  timeLeft: number;
  status: GameStatus;
  events: GameEvent[];
}

export function createGameState(
  seed = 1,
  options: GameOptions = defaultOptions,
): GameState {
  const { arena, player } = gameConfig;
  return {
    player: {
      x: arena.width / 2,
      y: arena.height / 2,
      angle: -Math.PI / 2,
      hp: player.maxHp,
      cooldowns: { front: 0, left: 0, right: 0 },
    },
    islands: arena.islands,
    projectiles: [],
    enemyProjectiles: [],
    enemies: [],
    spawnTimer: 0,
    spawnInterval: options.spawnIntervalSeconds,
    random: createRng(seed),
    score: 0,
    timeLeft: options.durationSeconds,
    status: "playing",
    events: [],
  };
}

export function updateGame(
  state: GameState,
  dt: number,
  input: GameInput,
): void {
  state.events = [];
  if (state.status !== "playing") return;
  const { arena, player: config } = gameConfig;
  const player = state.player;

  const turn =
    Number(input.isDown("rotateRight")) - Number(input.isDown("rotateLeft"));
  player.angle += turn * config.rotationSpeed * dt;

  if (input.isDown("forward")) {
    player.x += Math.cos(player.angle) * config.speed * dt;
    player.y += Math.sin(player.angle) * config.speed * dt;
  }

  for (const island of state.islands) {
    const pushed = pushOutOfCircle(
      { x: player.x, y: player.y, radius: config.radius },
      island,
    );
    player.x = pushed.x;
    player.y = pushed.y;
  }

  player.x = clamp(player.x, config.radius, arena.width - config.radius);
  player.y = clamp(player.y, config.radius, arena.height - config.radius);

  for (const shot of SHOTS) {
    const cooldowns = player.cooldowns;
    cooldowns[shot.weapon] = Math.max(0, cooldowns[shot.weapon] - dt);
    if (!input.isDown(shot.action) || cooldowns[shot.weapon] > 0) continue;

    const isBroadside = shot.weapon !== "front";
    const count = isBroadside ? config.broadsideProjectiles : 1;
    const angle = player.angle + shot.angleOffset;

    for (let i = 0; i < count; i++) {
      const spread = (i - (count - 1) / 2) * config.broadsideSpacing;
      const startX =
        player.x +
        Math.cos(angle) * config.radius +
        Math.cos(angle + Math.PI / 2) * spread;
      const startY =
        player.y +
        Math.sin(angle) * config.radius +
        Math.sin(angle + Math.PI / 2) * spread;
      state.projectiles.push(createProjectile(startX, startY, angle));
    }
    state.events.push({
      type: "shot",
      x: player.x + Math.cos(angle) * config.radius,
      y: player.y + Math.sin(angle) * config.radius,
    });

    cooldowns[shot.weapon] =
      (isBroadside ? config.broadsideCooldownMs : config.fireCooldownMs) / 1000;
  }

  state.projectiles = advanceProjectiles(state.projectiles, state, dt);
  state.enemyProjectiles = advanceProjectiles(
    state.enemyProjectiles,
    state,
    dt,
  );
  hitEnemies(state);
  updateEnemies(state, dt);
  enemiesHitPlayer(state);
  enemyShotsHitPlayer(state);

  state.timeLeft = Math.max(0, state.timeLeft - dt);
  if (player.hp === 0) {
    state.events.push({
      type: "explosion",
      x: player.x,
      y: player.y,
      size: "large",
    });
  }
  if (state.timeLeft === 0 || player.hp === 0) state.status = "over";
}

// Each enemy kind has its own block in the config (hp, speed, radius...).
function enemyStats(kind: EnemyKind) {
  return gameConfig[kind];
}

function hitEnemies(state: GameState): void {
  const { projectile: projectileConfig } = gameConfig;

  state.projectiles = state.projectiles.filter((p) => {
    const target = state.enemies.find((enemy) =>
      circlesOverlap(
        { x: p.x, y: p.y, radius: 0 },
        { x: enemy.x, y: enemy.y, radius: enemyStats(enemy.kind).radius },
      ),
    );
    if (!target) return true;

    target.hp -= projectileConfig.damage;
    state.events.push({ type: "hit", x: p.x, y: p.y });
    return false;
  });

  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) {
      state.events.push({
        type: "explosion",
        x: enemy.x,
        y: enemy.y,
        size: "small",
      });
    }
  }
  const before = state.enemies.length;
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
  state.score +=
    (before - state.enemies.length) * gameConfig.match.scorePerKill;
}

function enemiesHitPlayer(state: GameState): void {
  const { player: playerConfig } = gameConfig;
  const player = state.player;

  state.enemies = state.enemies.filter((enemy) => {
    const stats = enemyStats(enemy.kind);
    const touching = circlesOverlap(
      { x: enemy.x, y: enemy.y, radius: stats.radius },
      { x: player.x, y: player.y, radius: playerConfig.radius },
    );
    if (touching) {
      player.hp = Math.max(0, player.hp - stats.contactDamage);
      state.events.push({
        type: "explosion",
        x: enemy.x,
        y: enemy.y,
        size: "small",
      });
    }
    return !touching; // an enemy that crashed into the ship disappears
  });
}

function enemyShotsHitPlayer(state: GameState): void {
  const { player: playerConfig, shooter } = gameConfig;
  const player = state.player;

  state.enemyProjectiles = state.enemyProjectiles.filter((p) => {
    const hit = circlesOverlap(
      { x: p.x, y: p.y, radius: 0 },
      { x: player.x, y: player.y, radius: playerConfig.radius },
    );
    if (hit) {
      player.hp = Math.max(0, player.hp - shooter.shotDamage);
      state.events.push({ type: "hit", x: p.x, y: p.y });
    }
    return !hit; // a shot that hit the ship disappears
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function createProjectile(
  x: number,
  y: number,
  angle: number,
): ProjectileState {
  const { speed, lifetimeMs } = gameConfig.projectile;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    timeLeft: lifetimeMs / 1000,
  };
}

// Moves a list of projectiles and keeps only those still alive.
// Works for both the player's shots and the enemies' shots.
function advanceProjectiles(
  projectiles: ProjectileState[],
  state: GameState,
  dt: number,
): ProjectileState[] {
  const { arena } = gameConfig;

  for (const projectile of projectiles) {
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.timeLeft -= dt;
  }

  return projectiles.filter((p) => {
    const insideArena =
      p.x >= 0 && p.x <= arena.width && p.y >= 0 && p.y <= arena.height;
    const hitsIsland = state.islands.some((island) =>
      circlesOverlap({ x: p.x, y: p.y, radius: 0 }, island),
    );
    return p.timeLeft > 0 && insideArena && !hitsIsland;
  });
}

function createEnemy(kind: EnemyKind, point: Point): EnemyState {
  return {
    kind,
    x: point.x,
    y: point.y,
    angle: 0,
    hp: enemyStats(kind).maxHp,
    cooldown: 0,
  };
}

// A safe spawn point is free of islands and far enough from the player.
export function findSpawnPoint(state: GameState): Point | null {
  const { arena, chaser, spawn } = gameConfig;

  for (let attempt = 0; attempt < spawn.maxAttempts; attempt++) {
    const point = {
      x: state.random() < 0.5 ? chaser.radius : arena.width - chaser.radius,
      y: chaser.radius + state.random() * (arena.height - 2 * chaser.radius),
    };
    const farFromPlayer =
      Math.hypot(point.x - state.player.x, point.y - state.player.y) >=
      spawn.minDistanceFromPlayer;
    const freeOfIslands = !state.islands.some((island) =>
      circlesOverlap({ ...point, radius: chaser.radius }, island),
    );
    if (farFromPlayer && freeOfIslands) return point;
  }
  return null; // no safe place found: skip this spawn
}

function updateEnemies(state: GameState, dt: number): void {
  const { spawn, shooter } = gameConfig;
  const player = state.player;

  state.spawnTimer += dt;
  if (state.spawnTimer >= state.spawnInterval) {
    state.spawnTimer = 0;
    if (state.enemies.length < spawn.maxEnemies) {
      const point = findSpawnPoint(state);
      if (point) {
        const kind: EnemyKind = state.random() < 0.3 ? "shooter" : "chaser";
        state.enemies.push(createEnemy(kind, point));
      }
    }
  }

  for (const enemy of state.enemies) {
    const stats = enemyStats(enemy.kind);
    enemy.angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);

    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    const inRange = enemy.kind === "shooter" && distance <= shooter.range;

    if (!inRange) {
      enemy.x += Math.cos(enemy.angle) * stats.speed * dt;
      enemy.y += Math.sin(enemy.angle) * stats.speed * dt;
    }

    for (const island of state.islands) {
      const pushed = pushOutOfCircle(
        { x: enemy.x, y: enemy.y, radius: stats.radius },
        island,
      );
      enemy.x = pushed.x;
      enemy.y = pushed.y;
    }

    if (enemy.kind === "shooter") {
      enemy.cooldown = Math.max(0, enemy.cooldown - dt);
      if (inRange && enemy.cooldown === 0) {
        state.enemyProjectiles.push(
          createProjectile(
            enemy.x + Math.cos(enemy.angle) * stats.radius,
            enemy.y + Math.sin(enemy.angle) * stats.radius,
            enemy.angle,
          ),
        );
        state.events.push({
          type: "shot",
          x: enemy.x + Math.cos(enemy.angle) * stats.radius,
          y: enemy.y + Math.sin(enemy.angle) * stats.radius,
        });
        enemy.cooldown = shooter.fireCooldownMs / 1000;
      }
    }
  }
}
