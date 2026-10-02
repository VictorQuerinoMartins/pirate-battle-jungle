import type { MatchRecord } from "../api/types";
import { defaultOptions, type GameOptions } from "../game/core/options";

// Matches of "other players". No randomness: the same data on every run.
export function createFixtureRecords(
  count: number,
  config: GameOptions = defaultOptions,
  idPrefix = "fixture",
): MatchRecord[] {
  return Array.from({ length: count }, (_, index): MatchRecord => ({
    id: `${idPrefix}-${index + 1}`,
    playerId: `Captain ${index + 1}`,
    playedAt: new Date(Date.UTC(2026, 8, 1 + index, 12)).toISOString(),
    score: 5 + ((index * 7) % 23),
    durationSeconds: config.durationSeconds,
    reason: index % 4 === 0 ? "destroyed" : "time",
    config,
  }));
}