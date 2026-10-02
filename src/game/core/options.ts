import { gameConfig } from "../config/gameConfig";

export interface GameOptions {
  durationSeconds: number;
  spawnIntervalSeconds: number;
}

export const defaultOptions: GameOptions = {
  durationSeconds: gameConfig.match.durationSeconds,
  spawnIntervalSeconds: gameConfig.spawn.intervalMs / 1000,
};