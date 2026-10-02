export interface Point {
  x: number;
  y: number;
}

export interface Circle extends Point {
  radius: number;
}

export function circlesOverlap(a: Circle, b: Circle): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) < a.radius + b.radius;
}

export function pushOutOfCircle(mover: Circle, obstacle: Circle): Point {
  const dx = mover.x - obstacle.x;
  const dy = mover.y - obstacle.y;
  const distance = Math.hypot(dx, dy);
  const minDistance = mover.radius + obstacle.radius;

  if (distance >= minDistance) return { x: mover.x, y: mover.y };
  if (distance === 0) return { x: obstacle.x + minDistance, y: obstacle.y }; // same center: pick a side

  return {
    x: obstacle.x + (dx / distance) * minDistance,
    y: obstacle.y + (dy / distance) * minDistance,
  };
}

// Islands are made of axis-aligned rectangles: one rectangle, or a few that
// touch each other to form an L or T shape.
export interface Rect {
  x: number; // left
  y: number; // top
  width: number;
  height: number;
}

export interface Island {
  readonly rects: readonly Rect[];
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function pointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function circleOverlapsRect(circle: Circle, rect: Rect): boolean {
  const nearestX = clampNumber(circle.x, rect.x, rect.x + rect.width);
  const nearestY = clampNumber(circle.y, rect.y, rect.y + rect.height);
  return Math.hypot(circle.x - nearestX, circle.y - nearestY) < circle.radius;
}

export function pointInIsland(point: Point, island: Island): boolean {
  return island.rects.some((rect) => pointInRect(point, rect));
}

export function circleOverlapsIsland(circle: Circle, island: Island): boolean {
  return island.rects.some((rect) => circleOverlapsRect(circle, rect));
}

// Moves a circle out of one rectangle along the shortest way.
export function pushOutOfRect(mover: Circle, rect: Rect): Point {
  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;

  const nearestX = clampNumber(mover.x, left, right);
  const nearestY = clampNumber(mover.y, top, bottom);
  const dx = mover.x - nearestX;
  const dy = mover.y - nearestY;
  const distance = Math.hypot(dx, dy);

  if (distance >= mover.radius) return { x: mover.x, y: mover.y };
  if (distance > 0) {
    const scale = mover.radius / distance;
    return { x: nearestX + dx * scale, y: nearestY + dy * scale };
  }

  // The center is inside the rectangle: leave through the closest side.
  const toLeft = mover.x - left;
  const toRight = right - mover.x;
  const toTop = mover.y - top;
  const toBottom = bottom - mover.y;
  const closest = Math.min(toLeft, toRight, toTop, toBottom);
  if (closest === toLeft) return { x: left - mover.radius, y: mover.y };
  if (closest === toRight) return { x: right + mover.radius, y: mover.y };
  if (closest === toTop) return { x: mover.x, y: top - mover.radius };
  return { x: mover.x, y: bottom + mover.radius };
}

// Pushes out of every rectangle of the island. Two passes, because leaving one
// rectangle can touch the next one at the inner corner of an L shape.
export function pushOutOfIsland(mover: Circle, island: Island): Point {
  let point: Point = { x: mover.x, y: mover.y };
  for (let pass = 0; pass < 2; pass++) {
    for (const rect of island.rects) {
      point = pushOutOfRect({ ...point, radius: mover.radius }, rect);
    }
  }
  return point;
}
