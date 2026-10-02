import { useState } from "react";
import type { GameOptions } from "../../game/core/options";
import { loadPlayerId } from "../../storage/playerId";
import { HistoryPanel } from "../components/HistoryPanel";
import { RankingPanel } from "../components/RankingPanel";

interface MenuScreenProps {
  options: GameOptions;
  onPlay: () => void;
  onOptions: () => void;
}

type Tab = "ranking" | "history";

export function MenuScreen({ options, onPlay, onOptions }: MenuScreenProps) {
  const [tab, setTab] = useState<Tab>("ranking");
  const [playerId] = useState(() => loadPlayerId());
  const buttonStyle = { padding: "10px 28px", fontSize: 18, cursor: "pointer" };

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
        overflowY: "auto",
      }}
    >
      <h1 style={{ margin: 0 }}>Pirate Battle</h1>
      <button type="button" onClick={onPlay} style={buttonStyle}>
        Play
      </button>
      <button type="button" onClick={onOptions} style={buttonStyle}>
        Options
      </button>

      <div role="tablist" aria-label="Scores" style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "ranking"}
          onClick={() => setTab("ranking")}
        >
          Ranking
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "history"}
          onClick={() => setTab("history")}
        >
          Match History
        </button>
      </div>
      <div role="tabpanel">
        {tab === "ranking" ? (
          <RankingPanel options={options} />
        ) : (
          <HistoryPanel playerId={playerId} />
        )}
      </div>
    </div>
  );
}