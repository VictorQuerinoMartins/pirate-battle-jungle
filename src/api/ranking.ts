import type { GameOptions } from "../game/core/options";
import type { MatchRecord, Page, RankingEntry } from "./types";

export function sameConfig(a: GameOptions, b: GameOptions): boolean {
  return (
    a.durationSeconds === b.durationSeconds &&
    a.spawnIntervalSeconds === b.spawnIntervalSeconds
  );
}

function compareRecords(a: MatchRecord, b: MatchRecord): number {
  return (
    b.score - a.score ||
    a.playedAt.localeCompare(b.playedAt) ||
    a.id.localeCompare(b.id)
  );
}

export function rankRecords(
  records: readonly MatchRecord[],
  config: GameOptions,
): RankingEntry[] {
  return records
    .filter((record) => sameConfig(record.config, config))
    .sort(compareRecords)
    .map((record, index) => ({ ...record, position: index + 1 }));
}

export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): Page<T> {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
  };
}