import { describe, expect, it } from "vitest";
import { blobPoints } from "./islandShape";

describe("blobPoints", () => {
  it("stays inside the collision circle and close to it", () => {
    for (const phase of [0, 2.1, 4.2]) {
      const points = blobPoints(300, 200, 90, phase);
      for (let i = 0; i < points.length; i += 2) {
        const distance = Math.hypot(points[i] - 300, points[i + 1] - 200);
        expect(distance).toBeLessThanOrEqual(90 + 1e-9);
        expect(distance).toBeGreaterThanOrEqual(90 * 0.93 - 1e-9);
      }
    }
  });

  it("returns x and y pairs and the same shape for the same input", () => {
    const first = blobPoints(0, 0, 50, 1);
    expect(first.length % 2).toBe(0);
    expect(blobPoints(0, 0, 50, 1)).toEqual(first);
  });

  it("changes the shape with the phase", () => {
    expect(blobPoints(0, 0, 50, 0)).not.toEqual(blobPoints(0, 0, 50, 2));
  });
});