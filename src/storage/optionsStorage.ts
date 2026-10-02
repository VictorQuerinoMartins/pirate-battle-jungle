import {
  defaultOptions,
  sanitizeOptions,
  type GameOptions,
} from "../game/core/options";

const STORAGE_KEY = "pirate-battle:options";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

// The storage is a parameter so tests can use a fake one.
export function loadOptions(storage?: ReadableStorage): GameOptions {
  try {
    const text = (storage ?? localStorage).getItem(STORAGE_KEY);
    if (text === null) return defaultOptions;
    return sanitizeOptions(JSON.parse(text));
  } catch {
    return defaultOptions; // blocked storage or invalid JSON
  }
}

export function saveOptions(options: GameOptions, storage?: WritableStorage): void {
  try {
    (storage ?? localStorage).setItem(STORAGE_KEY, JSON.stringify(options));
  } catch {
    // storage may be unavailable: the options just will not be remembered
  }
}