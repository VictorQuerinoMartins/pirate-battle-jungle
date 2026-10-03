import { sanitizeOptions } from "../game/core/options";
import type { MatchResult } from "../ui/matchResult";

const STORAGE_KEY = "pirate-battle:last-result";

type ResultStorage = Pick<Storage, "getItem" | "setItem">;

export function saveLastResult(
  result: MatchResult,
  storage?: ResultStorage,
): void {
  try {
    (storage ?? localStorage).setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // the last result is a convenience: losing it never blocks the game
  }
}

export function loadLastResult(storage?: ResultStorage): MatchResult | null {
  try {
    const text = (storage ?? localStorage).getItem(STORAGE_KEY);
    if (text === null) return null;
    const value: unknown = JSON.parse(text);
    if (typeof value !== "object" || value === null) return null;
    const saved = value as Record<string, unknown>;
    if (
      typeof saved.matchId !== "string" ||
      typeof saved.playedAt !== "string" ||
      typeof saved.score !== "number" ||
      typeof saved.secondsPlayed !== "number" ||
      (saved.reason !== "time" && saved.reason !== "destroyed")
    ) {
      return null;
    }
    return {
      matchId: saved.matchId,
      playedAt: saved.playedAt,
      score: saved.score,
      secondsPlayed: saved.secondsPlayed,
      reason: saved.reason,
      config: sanitizeOptions(saved.config),
    };
  } catch {
    return null;
  }
}