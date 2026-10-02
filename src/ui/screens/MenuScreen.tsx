import type { GameOptions } from "../../game/core/options";
import { RankingPanel } from "../components/RankingPanel";

interface MenuScreenProps {
  options: GameOptions;
  onPlay: () => void;
  onOptions: () => void;
}

export function MenuScreen({ options, onPlay, onOptions }: MenuScreenProps) {
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
      <RankingPanel options={options} />
    </div>
  );
}