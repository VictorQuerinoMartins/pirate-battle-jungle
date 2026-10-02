import { describe, expect, it } from "vitest";
import { loadMuted, saveMuted } from "./soundStorage";

function fakeStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key: string, newValue: string) => {
      value = newValue;
    },
  };
}

describe("sound storage", () => {
  it("starts with the sound on", () => {
    expect(loadMuted(fakeStorage())).toBe(false);
  });

  it("remembers the choice", () => {
    const storage = fakeStorage();
    saveMuted(true, storage);
    expect(loadMuted(storage)).toBe(true);
    saveMuted(false, storage);
    expect(loadMuted(storage)).toBe(false);
  });

  it("does not break when the storage is blocked", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(loadMuted(blocked)).toBe(false);
    expect(() => saveMuted(true, blocked)).not.toThrow();
  });
});