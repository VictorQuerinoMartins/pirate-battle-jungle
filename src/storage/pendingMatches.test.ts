import { describe, expect, it } from "vitest";
import type { MatchRecord } from "../api/types";
import { defaultOptions } from "../game/core/options";
import {
  addPendingMatch,
  loadPendingMatches,
  removePendingMatch,
} from "./pendingMatches";

function fakeStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key: string, newValue: string) => {
      value = newValue;
    },
  };
}

function record(id: string): MatchRecord {
  return {
    id,
    playerId: "Pilot-test",
    playedAt: "2026-10-02T10:00:00.000Z",
    score: 3,
    durationSeconds: 60,
    reason: "time",
    config: defaultOptions,
  };
}

describe("pending matches", () => {
  it("keeps a match until it is removed", () => {
    const storage = fakeStorage();

    addPendingMatch(record("a"), storage);
    addPendingMatch(record("b"), storage);
    removePendingMatch("a", storage);

    expect(loadPendingMatches(storage).map((item) => item.id)).toEqual(["b"]);
  });

  it("does not store the same match twice", () => {
    const storage = fakeStorage();

    addPendingMatch(record("a"), storage);
    addPendingMatch(record("a"), storage);

    expect(loadPendingMatches(storage)).toHaveLength(1);
  });

  it("returns an empty list when the stored JSON is invalid", () => {
    expect(loadPendingMatches(fakeStorage("{not json"))).toEqual([]);
  });

  it("does not throw when the storage is blocked", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };

    expect(() => addPendingMatch(record("a"), blocked)).not.toThrow();
    expect(loadPendingMatches(blocked)).toEqual([]);
  });
});