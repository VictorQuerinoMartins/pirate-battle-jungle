import { describe, expect, it } from "vitest";
import { paginate, rankRecords } from "./ranking";
import type { MatchRecord } from "./types";

const config = { durationSeconds: 120, spawnIntervalSeconds: 3 };

function record(overrides: Partial<MatchRecord>): MatchRecord {
  return {
    id: "a",
    playerId: "player",
    playedAt: "2026-10-01T10:00:00.000Z",
    score: 10,
    durationSeconds: 120,
    reason: "time",
    config,
    ...overrides,
  };
}

describe("rankRecords", () => {
  it("sorts by score, highest first, and numbers the positions", () => {
    const ranking = rankRecords(
      [record({ id: "a", score: 5 }), record({ id: "b", score: 9 })],
      config,
    );

    expect(ranking.map((entry) => entry.id)).toEqual(["b", "a"]);
    expect(ranking.map((entry) => entry.position)).toEqual([1, 2]);
  });

  it("breaks ties by the earlier date and then by id", () => {
    const ranking = rankRecords(
      [
        record({ id: "c", score: 7, playedAt: "2026-10-01T12:00:00.000Z" }),
        record({ id: "b", score: 7, playedAt: "2026-10-01T10:00:00.000Z" }),
        record({ id: "a", score: 7, playedAt: "2026-10-01T10:00:00.000Z" }),
      ],
      config,
    );

    expect(ranking.map((entry) => entry.id)).toEqual(["a", "b", "c"]);
  });

  it("ignores matches played with another configuration", () => {
    const other = { durationSeconds: 60, spawnIntervalSeconds: 3 };
    const ranking = rankRecords(
      [record({ id: "a" }), record({ id: "b", config: other })],
      config,
    );

    expect(ranking.map((entry) => entry.id)).toEqual(["a"]);
  });

  it("does not change the list it receives", () => {
    const records = [record({ id: "a", score: 1 }), record({ id: "b", score: 2 })];

    rankRecords(records, config);

    expect(records.map((item) => item.id)).toEqual(["a", "b"]);
  });
});

describe("paginate", () => {
  it("returns the requested page and the total", () => {
    const page = paginate([1, 2, 3, 4, 5], 2, 2);

    expect(page).toEqual({ items: [3, 4], page: 2, pageSize: 2, total: 5 });
  });

  it("returns an empty page after the last one", () => {
    expect(paginate([1, 2, 3], 5, 2).items).toEqual([]);
  });
});