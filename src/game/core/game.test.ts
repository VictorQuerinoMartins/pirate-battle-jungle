import { describe, expect, it } from "vitest";
import { gameConfig } from "../config/gameConfig";
import { GameInput } from "../input/gameInput";
import { createGameState, updateGame } from "./game";

const { speed, rotationSpeed, radius } = gameConfig.player;

describe("updateGame", () => {
  it("moves the ship forward in the direction it is facing", () => {
    const state = createGameState();
    const input = new GameInput();
    const startX = state.player.x;
    const startY = state.player.y;
    input.press("forward");

    updateGame(state, 0.5, input);

    expect(state.player.x).toBeCloseTo(startX);
    expect(state.player.y).toBeCloseTo(startY - speed * 0.5);
  });

  it("rotates at the configured speed", () => {
    const state = createGameState();
    const input = new GameInput();
    const startAngle = state.player.angle;
    input.press("rotateRight");

    updateGame(state, 0.1, input);

    expect(state.player.angle).toBeCloseTo(startAngle + rotationSpeed * 0.1);
  });

  it("covers the same distance regardless of frame rate", () => {
    const slow = createGameState();
    const fast = createGameState();
    const input = new GameInput();
    input.press("forward");

    updateGame(slow, 0.1, input); // one big step
    for (let i = 0; i < 10; i++) updateGame(fast, 0.01, input); // ten small steps

    expect(fast.player.y).toBeCloseTo(slow.player.y);
  });

  it("keeps the ship inside the arena", () => {
    const state = createGameState();
    const input = new GameInput();
    input.press("forward");

    for (let i = 0; i < 1000; i++) updateGame(state, 0.1, input);

    expect(state.player.y).toBeGreaterThanOrEqual(radius);
    expect(state.player.x).toBeGreaterThanOrEqual(radius);
  });

  it("does not move without input", () => {
    const state = createGameState();
    const input = new GameInput();
    const startX = state.player.x;
    const startY = state.player.y;

    updateGame(state, 1, input);

    expect(state.player.x).toBe(startX);
    expect(state.player.y).toBe(startY);
  });

  it("does not let the ship enter an island", () => {
    const state = createGameState();
    const input = new GameInput();
    const island = state.islands[0];

    state.player.x = island.x + island.radius + 100;
    state.player.y = island.y;
    state.player.angle = Math.PI;
    input.press("forward");

    for (let i = 0; i < 200; i++) updateGame(state, 0.05, input);

    const distance = Math.hypot(
      state.player.x - island.x,
      state.player.y - island.y,
    );
    expect(distance).toBeGreaterThanOrEqual(radius + island.radius - 0.001);
  });

  it("fires a projectile in the facing direction when fireFront is pressed", () => {
    const state = createGameState();
    const input = new GameInput();
    input.press("fireFront");

    updateGame(state, 0.01, input);

    expect(state.projectiles).toHaveLength(1);
    expect(state.projectiles[0].vy).toBeLessThan(0);
  });

  it("respects the fire cooldown", () => {
    const state = createGameState();
    const input = new GameInput();
    input.press("fireFront");

    updateGame(state, 0.01, input);
    updateGame(state, 0.01, input);

    expect(state.projectiles).toHaveLength(1);
  });

  it("removes projectiles after their lifetime", () => {
    const state = createGameState();
    const input = new GameInput();
    input.press("fireFront");
    updateGame(state, 0.01, input);
    input.release("fireFront");

    updateGame(state, 2, input);

    expect(state.projectiles).toHaveLength(0);
  });

  it("removes a projectile that hits an island", () => {
    const state = createGameState();
    const input = new GameInput();
    const island = state.islands[0];
    state.projectiles.push({
      x: island.x,
      y: island.y,
      vx: 0,
      vy: 0,
      timeLeft: 1,
    });

    updateGame(state, 0.01, input);

    expect(state.projectiles).toHaveLength(0);
  });

  it("removes a projectile that leaves the arena", () => {
    const state = createGameState();
    const input = new GameInput();
    state.projectiles.push({
      x: gameConfig.arena.width - 1,
      y: 100,
      vx: 500,
      vy: 0,
      timeLeft: 1,
    });

    updateGame(state, 0.1, input);

    expect(state.projectiles).toHaveLength(0);
  });

  it("fires to the left and to the right with a broadside", () => {
    const left = createGameState();
    const leftInput = new GameInput();
    leftInput.press("fireLeft");
    updateGame(left, 0.01, leftInput);

    const right = createGameState();
    const rightInput = new GameInput();
    rightInput.press("fireRight");
    updateGame(right, 0.01, rightInput);

    expect(left.projectiles[0].vx).toBeLessThan(0);
    expect(right.projectiles[0].vx).toBeGreaterThan(0);
  });

  it("starts the shot at the edge of the ship", () => {
    const state = createGameState();
    const input = new GameInput();
    input.press("fireFront");

    updateGame(state, 0.01, input);

    const shot = state.projectiles[0];
    expect(state.player.y - shot.y).toBeGreaterThan(radius - 1);
  });
});

it("spawns an enemy after the spawn interval", () => {
  const state = createGameState();
  const input = new GameInput();

  updateGame(state, gameConfig.spawn.intervalMs / 1000 + 0.01, input);

  expect(state.enemies).toHaveLength(1);
});

it("never spawns more than the maximum number of enemies", () => {
  const state = createGameState();
  const input = new GameInput();

  for (let i = 0; i < 50; i++) updateGame(state, 1, input);

  expect(state.enemies.length).toBeLessThanOrEqual(gameConfig.spawn.maxEnemies);
});

it("moves a chaser toward the player", () => {
  const state = createGameState();
  const input = new GameInput();
  state.enemies.push({ x: 100, y: 100, angle: 0, hp: 30 });
  const before = Math.hypot(state.player.x - 100, state.player.y - 100);

  updateGame(state, 0.1, input);

  const enemy = state.enemies[0];
  const after = Math.hypot(state.player.x - enemy.x, state.player.y - enemy.y);
  expect(after).toBeLessThan(before);
});
