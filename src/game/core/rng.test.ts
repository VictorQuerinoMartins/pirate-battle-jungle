import { describe, expect, it } from 'vitest';
import { createRng } from './rng';

describe('createRng', () => {
  it('returns the same sequence for the same seed', () => {
    const a = createRng(42);
    const b = createRng(42);

    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('returns numbers between 0 and 1', () => {
    const rng = createRng(7);

    for (let i = 0; i < 100; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});