import type { GameOptions } from "../game/core/options";

export type EndReason = "time" | "destroyed";

export interface MatchResult {
  matchId: string; // created when the match starts
  playedAt: string; // ISO date of the end of the match
  config: GameOptions; // snapshot of the options used
  score: number;
  secondsPlayed: number;
  reason: EndReason;
}