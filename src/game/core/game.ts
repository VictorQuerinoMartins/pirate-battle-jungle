import { gameConfig } from "../config/gameConfig";
import type { Action, GameInput } from "../input/gameInput";
import { circlesOverlap, pushOutOfCircle, type Circle } from "./geometry";
import { createRng } from "./rng";

const SHOTS: readonly { action: Action; angleOffset: number }[] = [
  { action: "fireFront", angleOffset: 0 },
  { action: "fireLeft", angleOffset: -Math.PI / 2 },
  { action: "fireRight", angleOffset: Math.PI / 2 },
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
  fireCooldown: number;
}

export interface EnemyState {
  x: number;
  y: number;
  angle: number;
  hp: number;
}

export type GameStatus = "playing" | "over";

export interface GameState {
  player: PlayerState;
  islands: readonly Circle[];
  projectiles: ProjectileState[];
  enemies: EnemyState[];
  spawnTimer: number;
  random: () => number;
  score: number;
  timeLeft: number;
  status: GameStatus;
}

export function createGameState(seed = 1): GameState {
  const { arena, player } = gameConfig;
  return {
    player: {
      x: arena.width / 2,
      y: arena.height / 2,
      angle: -Math.PI / 2,
      hp: player.maxHp,
      fireCooldown: 0,
    },
        islands: arena.islands,
    projectiles: [],
    enemies: [],
    spawnTimer: 0,
    random: createRng(seed),
    score: 0,
    timeLeft: gameConfig.match.durationSeconds,
    status: "playing",
  };
}

export function updateGame(
  state: GameState,
  dt: number,
  input: GameInput,
): void {
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

  player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  if (player.fireCooldown === 0) {
    const shot = SHOTS.find((s) => input.isDown(s.action));
    if (shot) {
      const angle = player.angle + shot.angleOffset;
      const startX = player.x + Math.cos(angle) * config.radius;
      const startY = player.y + Math.sin(angle) * config.radius;
      state.projectiles.push(createProjectile(startX, startY, angle));
      player.fireCooldown = config.fireCooldownMs / 1000;
    }
  }

  updateProjectiles(state, dt);
  hitEnemies(state);
  updateEnemies(state, dt);
  enemiesHitPlayer(state);

  state.timeLeft = Math.max(0, state.timeLeft - dt);
  if (state.timeLeft === 0 || player.hp === 0) state.status = "over";
}

function hitEnemies(state: GameState): void {
  const { chaser, projectile: projectileConfig } = gameConfig;

  state.projectiles = state.projectiles.filter((p) => {
    const target = state.enemies.find((enemy) =>
      circlesOverlap(
        { x: p.x, y: p.y, radius: 0 },
        { x: enemy.x, y: enemy.y, radius: chaser.radius },
      ),
    );
    if (!target) return true;

    target.hp -= projectileConfig.damage;
    return false;
  });

  const before = state.enemies.length;
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
  state.score +=
    (before - state.enemies.length) * gameConfig.match.scorePerKill;
}

function enemiesHitPlayer(state: GameState): void {
  const { chaser, player: playerConfig } = gameConfig;
  const player = state.player;

  state.enemies = state.enemies.filter((enemy) => {
    const touching = circlesOverlap(
      { x: enemy.x, y: enemy.y, radius: chaser.radius },
      { x: player.x, y: player.y, radius: playerConfig.radius },
    );
    if (touching) {
      player.hp = Math.max(0, player.hp - chaser.contactDamage);
    }
    return !touching; // an enemy that crashed into the ship disappears
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

function updateProjectiles(state: GameState, dt: number): void {
  const { arena } = gameConfig;

  for (const projectile of state.projectiles) {
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.timeLeft -= dt;
  }

  state.projectiles = state.projectiles.filter((p) => {
    const insideArena =
      p.x >= 0 && p.x <= arena.width && p.y >= 0 && p.y <= arena.height;
    const hitsIsland = state.islands.some((island) =>
      circlesOverlap({ x: p.x, y: p.y, radius: 0 }, island),
    );
    return p.timeLeft > 0 && insideArena && !hitsIsland;
  });
}

function createChaser(state: GameState): EnemyState {
  const { arena, chaser } = gameConfig;
  return {
    x: state.random() < 0.5 ? 0 : arena.width,
    y: state.random() * arena.height,
    angle: 0,
    hp: chaser.maxHp,
  };
}

function updateEnemies(state: GameState, dt: number): void {
  const { spawn, chaser } = gameConfig;
  const player = state.player;

  state.spawnTimer += dt;
  if (state.spawnTimer >= spawn.intervalMs / 1000) {
    state.spawnTimer = 0;
    if (state.enemies.length < spawn.maxEnemies) {
      state.enemies.push(createChaser(state));
    }
  }

  for (const enemy of state.enemies) {
    enemy.angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.x += Math.cos(enemy.angle) * chaser.speed * dt;
    enemy.y += Math.sin(enemy.angle) * chaser.speed * dt;

    for (const island of state.islands) {
      const pushed = pushOutOfCircle(
        { x: enemy.x, y: enemy.y, radius: chaser.radius },
        island,
      );
      enemy.x = pushed.x;
      enemy.y = pushed.y;
    }
  }
}
