import { describe, expect, it } from "vitest";
import { GameInput } from "../input/gameInput";
import { createGameState, updateGame } from "./game";

function hasEvent(
  state: ReturnType<typeof createGameState>,
  type: string,
  size?: string,
): boolean {
  return state.events.some(
    (event) =>
      event.type === type && (size === undefined || ("size" in event && event.size === size)),
  );
}

describe("game events", () => {
  it("reports a shot when the player fires", () => {
    const state = createGameState(1);
    const input = new GameInput();
    input.press("fireFront");

    updateGame(state, 0.016, input);

    expect(hasEvent(state, "shot")).toBe(true);
  });

  it("reports a hit and an explosion when a shot destroys an enemy", () => {
    const state = createGameState(1);
    state.enemies.push({ kind: "chaser", x: 100, y: 100, angle: 0, hp: 1, cooldown: 0 });
    state.projectiles.push({ x: 100, y: 100, vx: 0, vy: 0, timeLeft: 1 });

    updateGame(state, 0.016, new GameInput());

    expect(hasEvent(state, "hit")).toBe(true);
    expect(hasEvent(state, "explosion", "small")).toBe(true);
    expect(state.score).toBe(1);
  });

  it("reports a large explosion when the player is destroyed", () => {
    const state = createGameState(1);
    state.player.hp = 1;
    state.enemies.push({
      kind: "chaser",
      x: state.player.x,
      y: state.player.y,
      angle: 0,
      hp: 10,
      cooldown: 0,
    });

    updateGame(state, 0.016, new GameInput());

    expect(hasEvent(state, "explosion", "large")).toBe(true);
    expect(state.status).toBe("over");
  });

  it("clears the events on the next update", () => {
    const state = createGameState(1);
    state.player.hp = 1;
    state.enemies.push({
      kind: "chaser",
      x: state.player.x,
      y: state.player.y,
      angle: 0,
      hp: 10,
      cooldown: 0,
    });
    updateGame(state, 0.016, new GameInput());

    updateGame(state, 0.016, new GameInput());

    expect(state.events).toHaveLength(0);
  });
});