import { describe, expect, it, vi } from "vitest";
import { GameLoop } from "./gameLoop";

describe("GameLoop.advance", () => {
  it("runs the simulation in fixed steps and draws once", () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ update, render });

    loop.advance(1, 0.25);

    expect(update).toHaveBeenCalledTimes(4);
    expect(update).toHaveBeenCalledWith(0.25);
    expect(render).toHaveBeenCalledTimes(1);
  });

  it("uses a shorter last step for the remaining time", () => {
    const update = vi.fn();
    const loop = new GameLoop({ update });

    loop.advance(0.3, 0.25);

    expect(update).toHaveBeenCalledTimes(2);
    expect(update.mock.calls[0][0]).toBe(0.25);
    expect(update.mock.calls[1][0]).toBeCloseTo(0.05);
  });

  it("does nothing while paused", () => {
    const update = vi.fn();
    const loop = new GameLoop({ update });
    loop.setPaused(true);

    loop.advance(5);

    expect(update).not.toHaveBeenCalled();
  });
});
