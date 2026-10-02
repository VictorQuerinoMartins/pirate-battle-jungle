import type { MatchRecord } from "../api/types";

const STORAGE_KEY = "pirate-battle:mock-matches";

type DbStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface MatchDb {
  all(): MatchRecord[];
  add(record: MatchRecord): boolean; 
  reset(): void;
}

export function createMatchDb(
  fixtures: readonly MatchRecord[],
  storage?: DbStorage,
): MatchDb {
  function loadSaved(): MatchRecord[] {
    try {
      const text = storage?.getItem(STORAGE_KEY);
      return text ? (JSON.parse(text) as MatchRecord[]) : [];
    } catch {
      return []; // blocked storage or invalid JSON
    }
  }

  function persist(): void {
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // the new match just will not survive a refresh
    }
  }

  let saved = loadSaved();

  return {
    all: () => [...fixtures, ...saved],
    add(record) {
      const exists = [...fixtures, ...saved].some((item) => item.id === record.id);
      if (exists) return false;
      saved = [...saved, record];
      persist();
      return true;
    },
    reset() {
      saved = [];
      try {
        storage?.removeItem(STORAGE_KEY);
      } catch {
        // nothing to clean
      }
    },
  };
}