import { describe, expect, it } from 'vitest';
import { circlesOverlap, pushOutOfCircle } from './geometry';

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