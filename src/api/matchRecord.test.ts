import { describe, expect, it } from "vitest";
import { defaultOptions } from "../game/core/options";
import { toMatchRecord } from "./matchRecord";

describe("toMatchRecord", () => {
  it("turns a match result into the record sent to the api", () => {
    const record = toMatchRecord(
      {
        matchId: "match-1",
        playedAt: "2026-10-02T10:00:00.000Z",
        config: defaultOptions,
        score: 7,
        secondsPlayed: 95,
        reason: "destroyed",
      },
      "Pilot-abc",
    );

    expect(record).toEqual({
      id: "match-1",
      playerId: "Pilot-abc",
      playedAt: "2026-10-02T10:00:00.000Z",
      score: 7,
      durationSeconds: 95,
      reason: "destroyed",
      config: defaultOptions,
    });
  });
});