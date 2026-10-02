import { describe, expect, it } from "vitest";
import type { GameEvent } from "../game/core/game";
import { soundsForUpdate, type FrameSnapshot } from "./soundMap";

const calm: FrameSnapshot = { score: 0, hp: 100, secondsLeft: 60 };

function shot(): GameEvent {
  return { type: "shot", x: 0, y: 0 };
}

describe("soundsForUpdate", () => {
  it("plays nothing when nothing happened", () => {
    expect(soundsForUpdate(calm, calm, [])).toEqual([]);
  });

  it("plays one cannon for a single shot and the broadside for three", () => {
    expect(soundsForUpdate(calm, calm, [shot()])).toEqual(["cannon"]);
    expect(soundsForUpdate(calm, calm, [shot(), shot(), shot()])).toEqual([
      "broadside",
    ]);
  });

  it("plays hit, small explosion and point when an enemy dies", () => {
    const events: GameEvent[] = [
      { type: "hit", x: 0, y: 0 },
      { type: "explosion", x: 0, y: 0, size: "small" },
    ];
    expect(
      soundsForUpdate(calm, { ...calm, score: 1 }, events),
    ).toEqual(["hit", "explosionSmall", "point"]);
  });

  it("plays the big explosion and the sinking when the player is destroyed", () => {
    const events: GameEvent[] = [
      { type: "explosion", x: 0, y: 0, size: "large" },
    ];
    expect(soundsForUpdate(calm, { ...calm, hp: 0 }, events)).toEqual([
      "explosionLarge",
      "sinking",
    ]);
  });

  it("warns once when the health crosses the low mark", () => {
    const before = { ...calm, hp: 35 };
    expect(soundsForUpdate(before, { ...before, hp: 30 }, [])).toEqual([
      "lowHealth",
    ]);
    expect(
      soundsForUpdate({ ...before, hp: 30 }, { ...before, hp: 25 }, []),
    ).toEqual([]);
  });

  it("warns once when ten seconds are left", () => {
    const before = { ...calm, secondsLeft: 11 };
    expect(soundsForUpdate(before, { ...before, secondsLeft: 10 }, [])).toEqual(
      ["timeWarning"],
    );
    expect(
      soundsForUpdate(
        { ...before, secondsLeft: 10 },
        { ...before, secondsLeft: 9 },
        [],
      ),
    ).toEqual([]);
  });
});