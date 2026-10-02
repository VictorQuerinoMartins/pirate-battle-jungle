const STORAGE_KEY = "pirate-battle:muted";

type MuteStorage = Pick<Storage, "getItem" | "setItem">;

export function loadMuted(storage?: MuteStorage): boolean {
  try {
    return (storage ?? localStorage).getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveMuted(muted: boolean, storage?: MuteStorage): void {
  try {
    (storage ?? localStorage).setItem(STORAGE_KEY, muted ? "1" : "0");
  } catch {
    // blocked storage: the choice just lasts until the page closes
  }
}