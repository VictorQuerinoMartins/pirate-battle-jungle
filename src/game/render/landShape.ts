import type { Rect } from "../core/geometry";

export interface WobbleOptions {
  corner: number; // radius of the round corners
  phase: number; // changes the wobble of each shape
  amplitude: number; // how far the edge moves in or out, in pixels
}

const STEP = 8; // distance between two points of the outline, in pixels

export function wobblyRectPoints(
  rect: Rect,
  grow: number,
  options: WobbleOptions,
): number[] {
  const left = rect.x - grow;
  const top = rect.y - grow;
  const right = rect.x + rect.width + grow;
  const bottom = rect.y + rect.height + grow;
  const width = right - left;
  const height = bottom - top;
  const r = Math.min(options.corner + grow, width / 2, height / 2);

  // Base points with the direction pointing out of the shape.
  const base: { x: number; y: number; nx: number; ny: number }[] = [];
  const line = (x1: number, y1: number, x2: number, y2: number, nx: number, ny: number) => {
    const count = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / STEP));
    for (let i = 0; i < count; i++) {
      const t = i / count;
      base.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, nx, ny });
    }
  };
  const arc = (cx: number, cy: number, from: number, to: number) => {
    const count = Math.max(2, Math.round((r * Math.abs(to - from)) / STEP));
    for (let i = 0; i < count; i++) {
      const a = from + ((to - from) * i) / count;
      base.push({
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
        nx: Math.cos(a),
        ny: Math.sin(a),
      });
    }
  };

  line(left + r, top, right - r, top, 0, -1);
  arc(right - r, top + r, -Math.PI / 2, 0);
  line(right, top + r, right, bottom - r, 1, 0);
  arc(right - r, bottom - r, 0, Math.PI / 2);
  line(right - r, bottom, left + r, bottom, 0, 1);
  arc(left + r, bottom - r, Math.PI / 2, Math.PI);
  line(left, bottom - r, left, top + r, -1, 0);
  arc(left + r, top + r, Math.PI, Math.PI * 1.5);

  // Whole numbers of waves, so the outline closes without a jump.
  const length = 2 * (rect.width + rect.height);
  const slow = Math.max(2, Math.round(length / 120));
  const fast = Math.max(3, Math.round(length / 60));

  const points: number[] = [];
  base.forEach((point, i) => {
    const u = i / base.length;
    const wobble =
      options.amplitude *
      (0.75 * Math.sin(2 * Math.PI * slow * u + options.phase) +
        0.25 * Math.sin(2 * Math.PI * fast * u + options.phase * 1.7));
    points.push(point.x + point.nx * wobble, point.y + point.ny * wobble);
  });
  return points;
}
