export type EndReason = "time" | "destroyed";

export interface MatchResult {
  score: number;
  secondsPlayed: number;
  reason: EndReason;
}