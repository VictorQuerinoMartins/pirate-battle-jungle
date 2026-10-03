import { describe, expect, it } from "vitest";
import { loadLastResult, saveLastResult } from "./lastResult";
import type { MatchResult } from "../ui/matchResult";

function fakeStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key: string, newValue: string) => {
      value = newValue;
    },
  };
}

const result: MatchResult = {
  matchId: "match-1",
  playedAt: "2026-10-02T12:00:00.000Z",
  config: { durationSeconds: 120, spawnIntervalSeconds: 3 },
  score: 7,
  secondsPlayed: 95,
  reason: "destroyed",
};

describe("last result", () => {
  it("returns nothing before any match was saved", () => {
    expect(loadLastResult(fakeStorage())).toBeNull();
  });

  it("saves and loads the last completed match", () => {
    const storage = fakeStorage();

    saveLastResult(result, storage);

    expect(loadLastResult(storage)).toEqual(result);
  });

  it("ignores data that is corrupted or has the wrong shape", () => {
    expect(loadLastResult(fakeStorage("not json"))).toBeNull();
    expect(loadLastResult(fakeStorage('{"score":"many"}'))).toBeNull();
  });

  it("does not break when the storage is blocked", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };

    expect(() => saveLastResult(result, blocked)).not.toThrow();
    expect(loadLastResult(blocked)).toBeNull();
  });
});