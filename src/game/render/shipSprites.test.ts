import { describe, expect, it } from 'vitest';
import { damageLevelFor, shipFrameName } from './shipSprites';

describe('shipFrameName', () => {
  it('picks the right frame for each color and damage level', () => {
    expect(shipFrameName('white', 0)).toBe('ship_1.png');
    expect(shipFrameName('red', 1)).toBe('ship_9.png');
    expect(shipFrameName('yellow', 3)).toBe('ship_24.png');
  });
});

describe('damageLevelFor', () => {
  it('gets worse as health drops', () => {
    expect(damageLevelFor(100, 100)).toBe(0);
    expect(damageLevelFor(60, 100)).toBe(1);
    expect(damageLevelFor(20, 100)).toBe(2);
    expect(damageLevelFor(0, 100)).toBe(3);
  });
});