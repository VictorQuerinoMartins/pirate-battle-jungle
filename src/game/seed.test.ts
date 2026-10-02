import { describe, expect, it } from "vitest";
import { seedFromSearch } from "./seed";

describe("seedFromSearch", () => {
  it("reads an integer seed from the url", () => {
    expect(seedFromSearch("?seed=42")).toBe(42);
  });

  it("returns null when there is no seed", () => {
    expect(seedFromSearch("?scenario=slow")).toBeNull();
  });

  it("returns null when the seed is empty", () => {
    expect(seedFromSearch("?seed=")).toBeNull();
  });

  it("returns null when the seed is not an integer", () => {
    expect(seedFromSearch("?seed=abc")).toBeNull();
    expect(seedFromSearch("?seed=1.5")).toBeNull();
  });
});