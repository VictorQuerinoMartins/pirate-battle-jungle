import { describe, expect, it } from 'vitest';
import {
  circleOverlapsIsland,
  circlesOverlap,
  pointInIsland,
  pushOutOfCircle,
  pushOutOfIsland,
  pushOutOfRect,
} from './geometry';

const island = { x: 100, y: 100, radius: 50 };

describe('circlesOverlap', () => {
  it('detects overlapping and separate circles', () => {
    expect(circlesOverlap({ x: 130, y: 100, radius: 20 }, island)).toBe(true);
    expect(circlesOverlap({ x: 200, y: 100, radius: 20 }, island)).toBe(false);
  });
});

describe('pushOutOfCircle', () => {
  it('leaves a non-overlapping circle where it is', () => {
    const result = pushOutOfCircle({ x: 200, y: 100, radius: 20 }, island);

    expect(result).toEqual({ x: 200, y: 100 });
  });

  it('pushes an overlapping circle out until it only touches', () => {
    const result = pushOutOfCircle({ x: 130, y: 100, radius: 20 }, island);

    expect(result.x).toBeCloseTo(170); // 100 + (50 + 20)
    expect(result.y).toBeCloseTo(100);
  });

  it('handles two circles with the same center', () => {
    const result = pushOutOfCircle({ x: 100, y: 100, radius: 20 }, island);

    expect(Number.isFinite(result.x)).toBe(true);
    expect(circlesOverlap({ ...result, radius: 20 }, island)).toBe(false);
  });
});

const block = { x: 100, y: 100, width: 200, height: 100 };
const lShape = {
  rects: [
    { x: 0, y: 0, width: 200, height: 100 },
    { x: 0, y: 100, width: 100, height: 100 },
  ],
};

describe('pushOutOfRect', () => {
  it('leaves a circle that is outside where it is', () => {
    expect(pushOutOfRect({ x: 50, y: 150, radius: 20 }, block)).toEqual({
      x: 50,
      y: 150,
    });
  });

  it('pushes a circle that touches a side straight out', () => {
    const result = pushOutOfRect({ x: 90, y: 150, radius: 20 }, block);

    expect(result.x).toBeCloseTo(80);
    expect(result.y).toBeCloseTo(150);
  });

  it('pushes a circle that touches a corner diagonally', () => {
    const result = pushOutOfRect({ x: 95, y: 95, radius: 20 }, block);

    expect(Math.hypot(result.x - 100, result.y - 100)).toBeCloseTo(20);
  });

  it('pushes a circle whose center is inside through the closest side', () => {
    const result = pushOutOfRect({ x: 290, y: 150, radius: 20 }, block);

    expect(result).toEqual({ x: 320, y: 150 });
  });
});

describe('islands made of several rectangles', () => {
  it('finds a point inside any of the rectangles', () => {
    expect(pointInIsland({ x: 50, y: 150 }, lShape)).toBe(true);
    expect(pointInIsland({ x: 150, y: 50 }, lShape)).toBe(true);
    expect(pointInIsland({ x: 150, y: 150 }, lShape)).toBe(false); // the notch
  });

  it('detects a circle that touches the island', () => {
    expect(circleOverlapsIsland({ x: 120, y: 150, radius: 25 }, lShape)).toBe(
      true,
    );
    expect(circleOverlapsIsland({ x: 160, y: 160, radius: 20 }, lShape)).toBe(
      false,
    );
  });

  it('pushes a circle out of the inner corner without entering a rectangle', () => {
    const result = pushOutOfIsland({ x: 110, y: 110, radius: 20 }, lShape);

    expect(circleOverlapsIsland({ ...result, radius: 20 - 0.001 }, lShape)).toBe(
      false,
    );
  });
});
