import { gameConfig } from "../../game/config/gameConfig";
import { formatTime } from "../formatTime";

export interface HudData {
  hp: number;
  score: number;
  secondsLeft: number;
}

export function Hud({ data }: { data: HudData }) {
  const { maxHp } = gameConfig.player;
  const percent = Math.max(0, Math.min(100, (data.hp / maxHp) * 100));

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        color: "#fff",
        fontWeight: 700,
        textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "relative", width: 220, height: 20 }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.5)", borderRadius: 10 }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: `${percent}%`,
            background: "#e0413a",
            borderRadius: 10,
          }}
        />
        <div style={{ position: "absolute", inset: 0, textAlign: "center", lineHeight: "20px", fontSize: 13 }}>
          {Math.round(data.hp)} / {maxHp}
        </div>
      </div>
      <div>Score {data.score}</div>
      <div>{formatTime(data.secondsLeft)}</div>
    </div>
  );
}