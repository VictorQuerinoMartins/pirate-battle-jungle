import { describe, expect, it } from "vitest";
import { createRandom, makeDebris } from "./debris";

describe("createRandom", () => {
  it("gives the same numbers for the same seed", () => {
    const a = createRandom(5);
    const b = createRandom(5);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("stays between 0 and 1", () => {
    const random = createRandom(9);
    for (let i = 0; i < 100; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("makeDebris", () => {
  it("makes a few pieces for an enemy and more for the player", () => {
    const small = makeDebris("small", createRandom(1)).length;
    const large = makeDebris("large", createRandom(1)).length;
    expect(small).toBeGreaterThanOrEqual(5);
    expect(small).toBeLessThanOrEqual(6);
    expect(large).toBe(13);
  });

  it("uses atlas frame names, positive speeds and lifetimes", () => {
    const pieces = makeDebris("large", createRandom(3));
    for (const piece of pieces) {
      expect(piece.frame).toMatch(/^(wood|sail_small|hull_small|cannon_loose)/);
      expect(piece.frame.endsWith(".png")).toBe(true);
      expect(piece.speed).toBeGreaterThan(0);
      expect(piece.life).toBeGreaterThan(0.5);
    }
  });

  it("is the same for the same seed", () => {
    expect(makeDebris("small", createRandom(7))).toEqual(
      makeDebris("small", createRandom(7)),
    );
  });
});