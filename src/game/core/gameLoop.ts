export interface GameLoopOptions {
  update: (dt: number) => void;
  render?: (dt: number) => void;
  maxDt?: number;
}

export class GameLoop {
  private readonly options: GameLoopOptions;
  private frameId: number | null = null;
  private lastTime = 0;
  private paused = false;

  constructor(options: GameLoopOptions) {
    this.options = options;
  }

  start(): void {
    if (this.frameId !== null) return; // already running
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  setPaused(value: boolean): void {
    this.paused = value;
    this.lastTime = performance.now();
  }

  advance(seconds: number, step = 0.05): void {
    if (this.paused) return;
    let rest = seconds;
    while (rest > 1e-9) {
      const dt = Math.min(step, rest);
      this.options.update(dt);
      rest -= dt;
    }
    this.options.render?.(0);
  }

  private tick = (now: number): void => {
    const maxDt = this.options.maxDt ?? 0.05;
    const rawDt = (now - this.lastTime) / 1000;
    const dt = Math.min(Math.max(rawDt, 0), maxDt);
    this.lastTime = now;

    if (!this.paused) {
      this.options.update(dt);
      this.options.render?.(dt);
    }

    this.frameId = requestAnimationFrame(this.tick);
  };
}
