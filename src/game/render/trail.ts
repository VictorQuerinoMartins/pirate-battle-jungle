export interface TrailSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  alpha: number; 
}

export const TRAIL_SECONDS = 0.09;
const SEGMENTS = 6;
const HEAD_WIDTH = 5;


export function trailSegments(
  x: number,
  y: number,
  vx: number,
  vy: number,
): TrailSegment[] {
  if (vx === 0 && vy === 0) return [];

  const segments: TrailSegment[] = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const from = i / SEGMENTS;
    const to = (i + 1) / SEGMENTS;
    segments.push({
      x1: x - vx * TRAIL_SECONDS * from,
      y1: y - vy * TRAIL_SECONDS * from,
      x2: x - vx * TRAIL_SECONDS * to,
      y2: y - vy * TRAIL_SECONDS * to,
      width: HEAD_WIDTH * (1 - from * 0.8),
      alpha: 1 - from,
    });
  }
  return segments;
}