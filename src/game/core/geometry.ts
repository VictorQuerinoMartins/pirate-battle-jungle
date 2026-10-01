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