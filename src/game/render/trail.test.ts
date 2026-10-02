import { describe, expect, it } from "vitest";
import { TRAIL_SECONDS, trailSegments } from "./trail";

describe("trailSegments", () => {
  it("starts at the shot and ends behind it", () => {
    const segments = trailSegments(100, 50, 500, 0);
    const first = segments[0];
    const last = segments[segments.length - 1];

    expect(first.x1).toBe(100);
    expect(first.y1).toBe(50);
    expect(last.x2).toBeCloseTo(100 - 500 * TRAIL_SECONDS);
    expect(last.y2).toBe(50);
  });

  it("gets thinner and fainter toward the tail", () => {
    const segments = trailSegments(0, 0, 0, -400);
    for (let i = 1; i < segments.length; i++) {
      expect(segments[i].width).toBeLessThan(segments[i - 1].width);
      expect(segments[i].alpha).toBeLessThan(segments[i - 1].alpha);
    }
  });

  it("joins the segments end to start", () => {
    const segments = trailSegments(10, 10, 300, 200);
    for (let i = 1; i < segments.length; i++) {
      expect(segments[i].x1).toBeCloseTo(segments[i - 1].x2);
      expect(segments[i].y1).toBeCloseTo(segments[i - 1].y2);
    }
  });

  it("draws nothing for a shot that is not moving", () => {
    expect(trailSegments(1, 1, 0, 0)).toEqual([]);
  });
});