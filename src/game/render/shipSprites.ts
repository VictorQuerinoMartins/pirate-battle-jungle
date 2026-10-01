const COLORS = ['white', 'black', 'red', 'green', 'blue', 'yellow'] as const;

export type ShipColor = (typeof COLORS)[number];
export type DamageLevel = 0 | 1 | 2 | 3;

export function shipFrameName(color: ShipColor, level: DamageLevel): string {
  const colorNumber = COLORS.indexOf(color) + 1;
  return `ship_${colorNumber + level * 6}.png`;
}

export function damageLevelFor(hp: number, maxHp: number): DamageLevel {
  if (hp <= 0) return 3;
  const ratio = hp / maxHp;
  if (ratio > 2 / 3) return 0;
  if (ratio > 1 / 3) return 1;
  return 2;
}