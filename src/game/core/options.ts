import { gameConfig } from "../config/gameConfig";

export interface GameOptions {
  durationSeconds: number;
  spawnIntervalSeconds: number;
}

export const defaultOptions: GameOptions = {
  durationSeconds: gameConfig.match.durationSeconds,
  spawnIntervalSeconds: gameConfig.spawn.intervalMs / 1000,
};

// Limits used by the Options screen and to validate stored values.
export const optionLimits = {
  durationSeconds: { min: 30, max: 300, step: 30 },
  spawnIntervalSeconds: { min: 1, max: 10, step: 1 },
} as const;

function sanitizeNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

// Turns anything (for example JSON read from storage) into valid options.
export function sanitizeOptions(value: unknown): GameOptions {
  const raw = (
    typeof value === "object" && value !== null ? value : {}
  ) as Partial<Record<keyof GameOptions, unknown>>;
  const { durationSeconds, spawnIntervalSeconds } = optionLimits;

  return {
    durationSeconds: sanitizeNumber(
      raw.durationSeconds,
      defaultOptions.durationSeconds,
      durationSeconds.min,
      durationSeconds.max,
    ),
    spawnIntervalSeconds: sanitizeNumber(
      raw.spawnIntervalSeconds,
      defaultOptions.spawnIntervalSeconds,
      spawnIntervalSeconds.min,
      spawnIntervalSeconds.max,
    ),
  };
}
