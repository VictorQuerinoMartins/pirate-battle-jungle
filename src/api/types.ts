import type { GameOptions } from "../game/core/options";
import type { EndReason } from "../ui/matchResult";

export interface MatchRecord {
  id: string;
  playerId: string;
  playedAt: string;
  score: number;
  durationSeconds: number;
  reason: EndReason;
  config: GameOptions;
}

export interface RankingEntry extends MatchRecord {
  position: number;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}