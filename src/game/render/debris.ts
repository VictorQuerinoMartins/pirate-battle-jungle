export type DebrisSize = "small" | "large";

export interface DebrisPiece {
  frame: string; // name in the ship atlas
  scale: number;
  angle: number;
  speed: number;
  spin: number;
  life: number; 
}

const WOOD = ["wood_1.png", "wood_2.png", "wood_3.png", "wood_4.png"];
const SAILS = Array.from({ length: 13 }, (_, i) => `sail_small_${i + 1}.png`);
const HULLS = [
  "hull_small_1.png",
  "hull_small_2.png",
  "hull_small_3.png",
  "hull_small_4.png",
];
const CANNON = "cannon_loose.png";

export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

export function makeDebris(
  size: DebrisSize,
  random: () => number,
): DebrisPiece[] {
  const large = size === "large";
  const frames: string[] = [];

  for (let i = 0; i < (large ? 8 : 4); i++) frames.push(pick(WOOD, random));
  frames.push(pick(SAILS, random));
  if (large) {
    frames.push(pick(SAILS, random), CANNON, pick(HULLS, random));
    frames.push(pick(HULLS, random));
  } else if (random() < 0.5) {
    frames.push(CANNON);
  }

  return frames.map((frame) => ({
    frame,
    scale: frame.startsWith("hull") ? 0.35 : 1.2,
    angle: random() * Math.PI * 2,
    speed: (large ? 120 : 90) + random() * (large ? 200 : 140),
    spin: (random() - 0.5) * 16,
    life: (large ? 1.3 : 0.9) + random() * 0.5,
  }));
}