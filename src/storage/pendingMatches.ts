import type { MatchRecord } from "../api/types";

const STORAGE_KEY = "pirate-battle:pending-matches";

type PendingStorage = Pick<Storage, "getItem" | "setItem">;

export function loadPendingMatches(storage?: PendingStorage): MatchRecord[] {
  try {
    const text = (storage ?? localStorage).getItem(STORAGE_KEY);
    if (text === null) return [];
    const value: unknown = JSON.parse(text);
    return Array.isArray(value) ? (value as MatchRecord[]) : [];
  } catch {
    return [];
  }
}

function savePendingMatches(
  records: MatchRecord[],
  storage?: PendingStorage,
): void {
  try {
    (storage ?? localStorage).setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // the match stays in memory only until the page is closed
  }
}

export function addPendingMatch(
  record: MatchRecord,
  storage?: PendingStorage,
): void {
  const current = loadPendingMatches(storage);
  if (current.some((item) => item.id === record.id)) return;
  savePendingMatches([...current, record], storage);
}

export function removePendingMatch(id: string, storage?: PendingStorage): void {
  const current = loadPendingMatches(storage);
  savePendingMatches(
    current.filter((item) => item.id !== id),
    storage,
  );
}

export function clearPendingMatches(storage?: PendingStorage): void {
  savePendingMatches([], storage);
}