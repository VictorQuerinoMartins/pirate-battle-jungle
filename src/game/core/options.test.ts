import { describe, expect, it } from "vitest";
import { defaultOptions, sanitizeOptions } from "./options";

describe("sanitizeOptions", () => {
  it("returns the defaults when the value is not an object", () => {
    expect(sanitizeOptions(null)).toEqual(defaultOptions);
    expect(sanitizeOptions("hello")).toEqual(defaultOptions);
  });

  it("keeps valid values", () => {
    const options = { durationSeconds: 90, spawnIntervalSeconds: 5 };
    expect(sanitizeOptions(options)).toEqual(options);
  });

  it("clamps values outside the limits", () => {
    const result = sanitizeOptions({ durationSeconds: 9999, spawnIntervalSeconds: 0 });
    expect(result.durationSeconds).toBe(300);
    expect(result.spawnIntervalSeconds).toBe(1);
  });

  it("replaces invalid values with the defaults", () => {
    const result = sanitizeOptions({ durationSeconds: "fast", spawnIntervalSeconds: NaN });
    expect(result).toEqual(defaultOptions);
  });
});