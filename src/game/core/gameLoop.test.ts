import { afterEach, describe, expect, it, vi } from "vitest";
import { GameLoop } from "./gameLoop";

function setup() {
  let frame: FrameRequestCallback = () => {};
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frame = callback;
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.spyOn(performance, "now").mockReturnValue(0);

  const update = vi.fn();
  const loop = new GameLoop({ update });
  loop.start();

  return { loop, update, runFrame: (time: number) => frame(time) };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GameLoop", () => {
  it("passes the elapsed time in seconds", () => {
    const { update, runFrame } = setup();

    runFrame(16);

    expect(update).toHaveBeenCalledWith(0.016);
  });

  it("clamps dt after a long stall", () => {
    const { update, runFrame } = setup();

    runFrame(2000);

    expect(update).toHaveBeenCalledWith(0.05);
  });

  it("never passes a negative dt", () => {
    const { update, runFrame } = setup();

    runFrame(-5);

    expect(update).toHaveBeenCalledWith(0);
  });

  it("does not call update while paused", () => {
    const { loop, update, runFrame } = setup();

    loop.setPaused(true);
    runFrame(16);

    expect(update).not.toHaveBeenCalled();
  });
});
