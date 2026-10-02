import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { GameOptions } from "../game/core/options";
import { fetchHistory, fetchRanking } from "./matchesApi";

export function useRanking(config: GameOptions, page: number) {
  return useQuery({
    queryKey: [
      "ranking",
      config.durationSeconds,
      config.spawnIntervalSeconds,
      page,
    ],
    queryFn: () => fetchRanking(config, page),
    placeholderData: keepPreviousData,
  });
}

export function useHistory(playerId: string, page: number) {
  return useQuery({
    queryKey: ["history", playerId, page],
    queryFn: () => fetchHistory(playerId, page),
    placeholderData: keepPreviousData,
  });
}