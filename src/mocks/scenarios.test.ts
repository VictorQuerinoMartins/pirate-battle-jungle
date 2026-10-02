import { describe, expect, it } from "vitest";
import { behaviorFor, loadScenario } from "./scenarios";

const middle = () => 0.5;

describe("behaviorFor", () => {
  it("answers right away in the normal scenario", () => {
    expect(behaviorFor("normal", "read", 0, middle)).toEqual({
      kind: "respond",
      delayMs: 0,
    });
  });

  it("answers the first request after the second in the out-of-order scenario", () => {
    expect(behaviorFor("out-of-order", "read", 0, middle)).toEqual({
      kind: "respond",
      delayMs: 2500,
    });
    expect(behaviorFor("out-of-order", "read", 1, middle)).toEqual({
      kind: "respond",
      delayMs: 100,
    });
  });

  it("fails only the reads in the read-failure scenario", () => {
    expect(behaviorFor("read-failure", "read", 0, middle).kind).toBe("status");
    expect(behaviorFor("read-failure", "write", 0, middle).kind).toBe(
      "respond",
    );
  });

  it("fails only the writes in the write-outage scenario", () => {
    expect(behaviorFor("write-outage", "write", 0, middle).kind).toBe(
      "network-error",
    );
    expect(behaviorFor("write-outage", "read", 0, middle).kind).toBe(
      "respond",
    );
  });

  it("never answers in the timeout scenario", () => {
    expect(behaviorFor("timeout", "read", 0, middle)).toEqual({ kind: "hang" });
  });
});

describe("loadScenario", () => {
  const stored = { getItem: () => "slow", setItem: () => {} };

  it("prefers the url parameter over the stored scenario", () => {
    expect(loadScenario(stored, "?scenario=timeout")).toBe("timeout");
  });

  it("uses the stored scenario when the url has none", () => {
    expect(loadScenario(stored, "")).toBe("slow");
  });

  it("falls back to normal when the value is unknown", () => {
    const unknown = { getItem: () => "nonsense", setItem: () => {} };
    expect(loadScenario(unknown, "?scenario=other")).toBe("normal");
  });
});