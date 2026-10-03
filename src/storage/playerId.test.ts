import { describe, expect, it } from "vitest";
import { cleanPlayerName, loadPlayerId, savePlayerName } from "./playerId";

function fakeStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key: string, newValue: string) => {
      value = newValue;
    },
  };
}

describe("loadPlayerId", () => {
  it("creates an id the first time and keeps it afterwards", () => {
    const storage = fakeStorage();

    const first = loadPlayerId(storage, () => "Pilot-new");
    const second = loadPlayerId(storage, () => "Pilot-other");

    expect(first).toBe("Pilot-new");
    expect(second).toBe("Pilot-new");
  });

  it("uses the id that was already saved", () => {
    expect(loadPlayerId(fakeStorage("Pilot-saved"))).toBe("Pilot-saved");
  });

  it("still returns the same id when the storage is blocked", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };

    expect(loadPlayerId(blocked)).toBe(loadPlayerId(blocked));
  });

  describe("player name", () => {
    it("cleans extra spaces and limits the length", () => {
      expect(cleanPlayerName("  Jack   Sparrow  ")).toBe("Jack Sparrow");
      expect(cleanPlayerName("A".repeat(40))).toHaveLength(16);
    });

    it("saves the name so loadPlayerId returns it", () => {
      const storage = fakeStorage("Pilot-old");

      expect(savePlayerName("Blackbeard", storage)).toBe("Blackbeard");
      expect(loadPlayerId(storage)).toBe("Blackbeard");
    });

    it("keeps the previous name when the new one is empty", () => {
      const storage = fakeStorage("Pilot-old");

      expect(savePlayerName("   ", storage)).toBe("Pilot-old");
      expect(loadPlayerId(storage)).toBe("Pilot-old");
    });
  });
});
