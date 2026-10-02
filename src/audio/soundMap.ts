import type { GameEvent } from "../game/core/game";

export type SoundName =
  | "cannon"
  | "broadside"
  | "hit"
  | "explosionSmall"
  | "explosionLarge"
  | "sinking"
  | "point"
  | "lowHealth"
  | "timeWarning"
  | "start"
  | "pause"
  | "resume"
  | "complete"
  | "over"
  | "click";

export interface FrameSnapshot {
  score: number;
  hp: number;
  secondsLeft: number;
}

export const LOW_HEALTH = 30;
export const TIME_WARNING_SECONDS = 10;

export function soundsForUpdate(
  before: FrameSnapshot,
  after: FrameSnapshot,
  events: readonly GameEvent[],
): SoundName[] {
  const sounds: SoundName[] = [];

  const shots = events.filter((event) => event.type === "shot").length;
  if (shots >= 3) sounds.push("broadside");
  else if (shots > 0) sounds.push("cannon");

  if (events.some((event) => event.type === "hit")) sounds.push("hit");

  const bigExplosion = events.some(
    (event) => event.type === "explosion" && event.size === "large",
  );
  if (bigExplosion) {
    sounds.push("explosionLarge", "sinking");
  } else if (events.some((event) => event.type === "explosion")) {
    sounds.push("explosionSmall");
  }

  if (after.score > before.score) sounds.push("point");

  if (before.hp > LOW_HEALTH && after.hp <= LOW_HEALTH && after.hp > 0) {
    sounds.push("lowHealth");
  }

  if (
    before.secondsLeft > TIME_WARNING_SECONDS &&
    after.secondsLeft <= TIME_WARNING_SECONDS &&
    after.secondsLeft > 0
  ) {
    sounds.push("timeWarning");
  }

  return sounds;
}