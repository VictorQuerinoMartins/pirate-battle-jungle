const POINTS = 72;

// A circle with a gentle wobble, so an island does not look like a coin. It
// never goes past `radius`, so the drawing stays inside the collision circle.
// `phase` makes each island different.
export function blobPoints(
  cx: number,
  cy: number,
  radius: number,
  phase = 0,
): number[] {
  const points: number[] = [];
  for (let i = 0; i < POINTS; i++) {
    const angle = (i / POINTS) * Math.PI * 2;
    const wobble =
      0.6 * Math.sin(3 * angle + phase) +
      0.4 * Math.sin(5 * angle + phase * 1.7);
    const r = radius * (0.965 + 0.035 * wobble); // between 0.93 and 1.0
    points.push(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
  }
  return points;
}