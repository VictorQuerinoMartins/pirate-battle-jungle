import type { MatchResult } from "../matchResult";

interface ResultScreenProps {
  result: MatchResult;
  onPlayAgain: () => void;
}

export function ResultScreen({ result, onPlayAgain }: ResultScreenProps) {
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
      <h1 style={{ margin: 0 }}>BATTLE COMPLETE</h1>
      <p style={{ margin: 0, fontSize: 24 }}>Score {result.score}</p>
      <button
        type="button"
        onClick={onPlayAgain}
        style={{ padding: "10px 28px", fontSize: 18, cursor: "pointer" }}
      >
        Play again
      </button>
    </div>
  );
}