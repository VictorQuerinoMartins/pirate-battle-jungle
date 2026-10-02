import { formatTime } from "../formatTime";
import type { MatchResult } from "../matchResult";

interface ResultScreenProps {
  result: MatchResult;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export function ResultScreen({
  result,
  onPlayAgain,
  onMainMenu,
}: ResultScreenProps) {
  const title = result.reason === "time" ? "TIME'S UP" : "SHIP DESTROYED";

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "#102a43",
        color: "#fff",
      }}
    >
      <h1 style={{ margin: 0 }}>{title}</h1>
      <p style={{ margin: 0, fontSize: 24 }}>Score {result.score}</p>
      <p style={{ margin: 0, fontSize: 18 }}>
        Time played {formatTime(result.secondsPlayed)}
      </p>
      <button
        type="button"
        onClick={onPlayAgain}
        style={{ padding: "10px 28px", fontSize: 18, cursor: "pointer" }}
      >
        Play again
      </button>
      <button
        type="button"
        onClick={onMainMenu}
        style={{ padding: "10px 28px", fontSize: 18, cursor: "pointer" }}
      >
        Main menu
      </button>
    </div>
  );
}