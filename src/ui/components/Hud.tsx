import { gameConfig } from "../../game/config/gameConfig";
import { formatTime } from "../formatTime";

export interface HudData {
  hp: number;
  score: number;
  secondsLeft: number;
}

export function Hud({ data }: { data: HudData }) {
  const { maxHp } = gameConfig.player;
  const ratio = Math.max(0, Math.min(1, data.hp / maxHp));
  const fill =
    ratio > 0.5
      ? "f-health-green"
      : ratio > 0.25
        ? "f-health-amber"
        : "f-health-red";

  return (
    <div className="hud">
      <div
        className="hud-health"
        role="meter"
        aria-label="Ship health"
        aria-valuemin={0}
        aria-valuemax={maxHp}
        aria-valuenow={Math.round(data.hp)}
      >
        <span className="sprite f-health-frame" aria-hidden="true" />
        <span
          className={`sprite ${fill}`}
          style={{ clipPath: `inset(0 ${(1 - ratio) * 100}% 0 0)` }}
          aria-hidden="true"
        />
        <span className="hud-health-text">
          {Math.round(data.hp)} / {maxHp}
        </span>
      </div>
      <div className="hud-right">
        <div className="sprite f-counter hud-counter">
          <span className="sprite f-icon-score" aria-hidden="true" />
          <span>Score {data.score}</span>
        </div>
        <div className="sprite f-counter hud-counter">
          <span className="sprite f-icon-time" aria-hidden="true" />
          <span role="timer">{formatTime(data.secondsLeft)}</span>
        </div>
      </div>
    </div>
  );
}