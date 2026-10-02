import type { MatchResult } from "../ui/matchResult";
import type { MatchRecord } from "./types";

export function toMatchRecord(
  result: MatchResult,
  playerId: string,
): MatchRecord {
  return {
    id: result.matchId,
    playerId,
    playedAt: result.playedAt,
    score: result.score,
    durationSeconds: result.secondsPlayed,
    reason: result.reason,
    config: result.config,
  };
}