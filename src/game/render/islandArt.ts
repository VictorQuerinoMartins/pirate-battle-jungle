import type { Rect } from "../core/geometry";

// How each island of `gameConfig.arena.islands` is dressed. This is only
// drawing: the grass sits inside the sand, with a margin of sand around it,
// and nothing here changes how the ships collide.

export interface PlantSpot {
  x: number;
  y: number;
  plant: 0 | 1 | 2; // which of the three plant arts
  scale: number;
}

export interface DecorSpot {
  x: number;
  y: number;
  tile: number; // tile number in tiles_sheet.png (a rock or tiny leaves)
  scale: number;
  rotation: number;
}

export interface IslandArt {
  grass: readonly Rect[];
  plants: readonly PlantSpot[];
  decor: readonly DecorSpot[];
}

export const ISLAND_ART: readonly IslandArt[] = [
  // Left: the fort island.
  {
    grass: [{ x: 130, y: 100, width: 240, height: 160 }],
    plants: [
      { x: 335, y: 150, plant: 1, scale: 1 },
      { x: 330, y: 225, plant: 2, scale: 0.8 },
    ],
    decor: [
      { x: 392, y: 120, tile: 49, scale: 0.55, rotation: 0.9 },
      { x: 170, y: 235, tile: 87, scale: 1, rotation: 2.1 },
    ],
  },
  // Right: an L shape.
  {
    grass: [
      { x: 920, y: 180, width: 220, height: 50 },
      { x: 1040, y: 180, width: 100, height: 170 },
    ],
    plants: [
      { x: 1090, y: 235, plant: 1, scale: 0.9 },
      { x: 1085, y: 310, plant: 2, scale: 0.8 },
    ],
    decor: [
      { x: 1110, y: 372, tile: 66, scale: 0.55, rotation: 1.6 },
      { x: 960, y: 205, tile: 87, scale: 1, rotation: 0.7 },
    ],
  },
  // Bottom.
  {
    grass: [{ x: 500, y: 540, width: 240, height: 90 }],
    plants: [
      { x: 565, y: 590, plant: 1, scale: 0.9 },
      { x: 680, y: 585, plant: 2, scale: 0.85 },
    ],
    decor: [
      { x: 640, y: 520, tile: 65, scale: 0.55, rotation: 4.1 },
      { x: 625, y: 555, tile: 88, scale: 1, rotation: 1.2 },
    ],
  },
];
