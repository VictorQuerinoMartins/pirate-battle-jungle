import { loadMuted, saveMuted } from "../storage/soundStorage";
import type { SoundName } from "./soundMap";

const BASE = `${import.meta.env.BASE_URL}assets/sounds/`;


const FILES: Record<SoundName, readonly string[]> = {
  cannon: ["cannon_fire_1", "cannon_fire_2", "cannon_fire_3"],
  broadside: ["cannon_broadside"],
  hit: ["ship_wood_hit_1", "ship_wood_hit_2"],
  explosionSmall: ["ship_explosion_1"],
  explosionLarge: ["ship_explosion_2"],
  sinking: ["ship_sinking"],
  point: ["score_point"],
  lowHealth: ["health_low"],
  timeWarning: ["time_warning"],
  start: ["game_start"],
  pause: ["game_pause"],
  resume: ["game_resume"],
  complete: ["game_complete"],
  over: ["game_over"],
  click: ["ui_click"],
};

const VOLUME: Partial<Record<SoundName, number>> = {
  cannon: 0.35,
  broadside: 0.45,
  hit: 0.4,
  click: 0.5,
};

class SoundPlayer {
  private muted = loadMuted();
  private silentDepth = 0;
  private turns = new Map<SoundName, number>();
  private ambience: HTMLAudioElement | null = null;
  private ambienceWanted = false;
  private listeners = new Set<() => void>();

  isMuted = (): boolean => this.muted;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  setMuted(value: boolean): void {
    this.muted = value;
    saveMuted(value);
    this.updateAmbience();
    this.listeners.forEach((listener) => listener());
  }

  play(name: SoundName): void {
    if (this.muted || this.silentDepth > 0 || typeof Audio === "undefined") {
      return;
    }
    const files = FILES[name];
    const turn = this.turns.get(name) ?? 0;
    this.turns.set(name, turn + 1);

    const audio = new Audio(`${BASE}${files[turn % files.length]}.wav`);
    audio.volume = VOLUME[name] ?? 0.6;
    void audio.play().catch(() => undefined);
  }

  silently(run: () => void): void {
    this.silentDepth += 1;
    try {
      run();
    } finally {
      this.silentDepth -= 1;
    }
  }

  setAmbience(wanted: boolean): void {
    this.ambienceWanted = wanted;
    this.updateAmbience();
  }

  private updateAmbience(): void {
    if (typeof Audio === "undefined") return;
    if (this.ambienceWanted && !this.muted) {
      if (!this.ambience) {
        this.ambience = new Audio(`${BASE}ocean_ambience_loop.wav`);
        this.ambience.loop = true;
        this.ambience.volume = 0.25;
      }
      void this.ambience.play().catch(() => undefined);
    } else {
      this.ambience?.pause();
    }
  }
}

export const sound = new SoundPlayer();