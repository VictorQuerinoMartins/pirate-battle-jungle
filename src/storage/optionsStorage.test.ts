import { describe, expect, it } from "vitest";
import { defaultOptions } from "../game/core/options";
import { loadOptions, saveOptions } from "./optionsStorage";

function fakeStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key: string, newValue: string) => {
      value = newValue;
    },
  };
}

describe("optionsStorage", () => {
  it("loads back what was saved", () => {
    const storage = fakeStorage();
    const options = { durationSeconds: 60, spawnIntervalSeconds: 2 };

    saveOptions(options, storage);

    expect(loadOptions(storage)).toEqual(options);
  });

  it("returns the defaults when the stored JSON is invalid", () => {
    expect(loadOptions(fakeStorage("{not json"))).toEqual(defaultOptions);
  });

  it("returns the defaults when the storage throws", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
    };

    expect(loadOptions(blocked)).toEqual(defaultOptions);
  });
});