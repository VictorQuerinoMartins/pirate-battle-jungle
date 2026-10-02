const STORAGE_KEY = "pirate-battle:player-id";

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