const STORAGE_KEY = "pirate-battle:player-id";

export const MAX_NAME_LENGTH = 16;

type PlayerStorage = Pick<Storage, "getItem" | "setItem">;

function createPlayerId(): string {
  return `Pilot-${crypto.randomUUID().slice(0, 8)}`;
}

let fallbackId: string | null = null;

export function loadPlayerId(
  storage?: PlayerStorage,
  createId: () => string = createPlayerId,
): string {
  try {
    const store = storage ?? localStorage;
    const saved = store.getItem(STORAGE_KEY);
    if (saved) return saved;

    const id = createId();
    store.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    fallbackId ??= createId();
    return fallbackId;
  }
}

export function cleanPlayerName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

export function savePlayerName(
  name: string,
  storage?: PlayerStorage,
): string {
  const clean = cleanPlayerName(name);
  if (!clean) return loadPlayerId(storage);
  try {
    (storage ?? localStorage).setItem(STORAGE_KEY, clean);
  } catch {
    fallbackId = clean;
  }
  return clean;
}