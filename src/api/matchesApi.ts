import type { GameOptions } from "../game/core/options";
import { apiClient } from "./client";
import type { MatchRecord, Page, RankingEntry } from "./types";

export const PAGE_SIZE = 10;

export async function postMatch(record: MatchRecord): Promise<MatchRecord> {
  const response = await apiClient.post<MatchRecord>("/matches", record);
  return response.data;
}

export async function fetchHistory(
  playerId: string,
  page: number,
): Promise<Page<MatchRecord>> {
  const response = await apiClient.get<Page<MatchRecord>>("/matches", {
    params: { playerId, page, pageSize: PAGE_SIZE },
  });
  return response.data;
}

export async function fetchRanking(
  config: GameOptions,
  page: number,
): Promise<Page<RankingEntry>> {
  const response = await apiClient.get<Page<RankingEntry>>("/ranking", {
    params: {
      durationSeconds: config.durationSeconds,
      spawnIntervalSeconds: config.spawnIntervalSeconds,
      page,
      pageSize: PAGE_SIZE,
    },
  });
  return response.data;
}