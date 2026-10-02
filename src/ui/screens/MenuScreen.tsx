import { useState } from "react";
import type { GameOptions } from "../../game/core/options";
import { loadPlayerId } from "../../storage/playerId";
import { ControlsHelp } from "../components/ControlsHelp";
import { HistoryPanel } from "../components/HistoryPanel";
import { RankingPanel } from "../components/RankingPanel";
import { ScenarioPanel } from "../components/ScenarioPanel";
import { SpriteButton } from "../components/SpriteButton";

interface MenuScreenProps {
  options: GameOptions;
  onPlay: () => void;
  onOptions: () => void;
}

type Tab = "ranking" | "history";

export function MenuScreen({ options, onPlay, onOptions }: MenuScreenProps) {
  const [tab, setTab] = useState<Tab>("ranking");
  const [playerId] = useState(() => loadPlayerId());

  return (
    <div className="scene">
      <div className="menu-column">
        <h1 className="menu-title">
          <span
            className="sprite f-title scale-lg"
            role="img"
            aria-label="Pirate Battle"
          />
        </h1>
        <div className="sprite f-panel card scale-lg">
          <SpriteButton onClick={onPlay}>Play</SpriteButton>
          <SpriteButton variant="secondary" onClick={onOptions}>
            Options
          </SpriteButton>
          <ControlsHelp />
        </div>
      </div>

      <div className="scores">
        <div role="tablist" aria-label="Scores">
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
        <ScenarioPanel />
      </div>
    </div>
  );
}