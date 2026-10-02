import { describe, expect, it } from "vitest";
import { wobblyRectPoints } from "./landShape";

const rect = { x: 100, y: 50, width: 300, height: 200 };
const options = { corner: 24, phase: 1.3, amplitude: 6 };

function bounds(points: number[]) {
  const xs = points.filter((_, i) => i % 2 === 0);
  const ys = points.filter((_, i) => i % 2 === 1);
  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys),
  };
}

describe("wobblyRectPoints", () => {
  it("gives x and y pairs", () => {
    expect(wobblyRectPoints(rect, 0, options).length % 2).toBe(0);
  });

  it("stays within the wobble amplitude around the rectangle", () => {
    const box = bounds(wobblyRectPoints(rect, 0, options));

    expect(box.left).toBeGreaterThanOrEqual(100 - 6 - 0.001);
    expect(box.right).toBeLessThanOrEqual(400 + 6 + 0.001);
    expect(box.top).toBeGreaterThanOrEqual(50 - 6 - 0.001);
    expect(box.bottom).toBeLessThanOrEqual(250 + 6 + 0.001);
  });

  it("is the plain rounded rectangle when the amplitude is zero", () => {
    const box = bounds(
      wobblyRectPoints(rect, 0, { ...options, amplitude: 0 }),
    );

    expect(box.left).toBeCloseTo(100);
    expect(box.right).toBeCloseTo(400);
    expect(box.top).toBeCloseTo(50);
    expect(box.bottom).toBeCloseTo(250);
  });

  it("grows when asked to", () => {
    const small = bounds(wobblyRectPoints(rect, 0, { ...options, amplitude: 0 }));
    const big = bounds(wobblyRectPoints(rect, 10, { ...options, amplitude: 0 }));

    expect(big.right - big.left).toBeCloseTo(small.right - small.left + 20);
  });

  it("always gives the same shape for the same input", () => {
    expect(wobblyRectPoints(rect, 4, options)).toEqual(
      wobblyRectPoints(rect, 4, options),
    );
  });
});
