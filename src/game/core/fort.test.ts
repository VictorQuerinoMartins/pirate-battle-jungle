import { describe, expect, it } from "vitest";
import { gameConfig } from "../config/gameConfig";
import { GameInput } from "../input/gameInput";
import { createGameState, updateGame, type GameState } from "./game";

const input = new GameInput();

function quietState(score: number): GameState {
  const state = createGameState(1);
  state.score = score;
  state.spawnInterval = 1000; // no enemy gets in the way
  state.player.x = 500; // in the open sea, inside the fort's range
  state.player.y = 200;
  return state;
}

// Runs the game and returns how many "shot" events happened.
function run(state: GameState, seconds: number, step = 0.05): number {
  let shots = 0;
  for (let t = 0; t < seconds - 1e-9; t += step) {
    updateGame(state, step, input);
    shots += state.events.filter((event) => event.type === "shot").length;
  }
  return shots;
}

describe("fort cannon", () => {
  it("stays asleep below the unlock score", () => {
    const state = quietState(gameConfig.fort.unlockScore - 1);

    expect(run(state, 8)).toBe(0);
    expect(state.fort.active).toBe(false);
    expect(state.enemyProjectiles).toHaveLength(0);
  });

  it("wakes up, waits one cooldown, then aims at the player", () => {
    const state = quietState(gameConfig.fort.unlockScore);
    let elapsed = 0;
    while (state.enemyProjectiles.length === 0 && elapsed < 6) {
      updateGame(state, 0.05, input);
      elapsed += 0.05;
    }

    expect(state.fort.active).toBe(true);
    expect(elapsed).toBeGreaterThan(2.9);
    expect(elapsed).toBeLessThan(3.3);

    const shot = state.enemyProjectiles[0];
    expect(shot.damage).toBe(gameConfig.fort.shotDamage);
    expect(shot.vx).toBeGreaterThan(0); // the player is to the right...
    expect(shot.vy).toBeGreaterThan(0); // ...and below the fort
  });

  it("does not lose its shot over the island it stands on", () => {
    const state = quietState(gameConfig.fort.unlockScore);
    while (state.enemyProjectiles.length === 0) updateGame(state, 0.05, input);

    run(state, 0.5);

    expect(state.enemyProjectiles.length).toBeGreaterThan(0);
  });

  it("does not fire when the player is out of range", () => {
    const state = quietState(gameConfig.fort.unlockScore);
    state.player.x = 1200;
    state.player.y = 700;

    expect(run(state, 10)).toBe(0);
  });

  it("fires slowly: one shot per cooldown", () => {
    const state = quietState(gameConfig.fort.unlockScore);

    const shots = run(state, 6.4);

    expect(shots).toBeGreaterThanOrEqual(1);
    expect(shots).toBeLessThanOrEqual(2);
  });

  it("takes the fort's own damage from the player", () => {
    const state = quietState(gameConfig.fort.unlockScore);
    state.player.x = 600;
    state.player.y = 200;

    run(state, 4.5);

    expect(state.player.hp).toBe(
      gameConfig.player.maxHp - gameConfig.fort.shotDamage,
    );
  });
});
