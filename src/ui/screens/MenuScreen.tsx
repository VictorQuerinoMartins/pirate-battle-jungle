import { useState } from "react";
import type { GameOptions } from "../../game/core/options";
import {
  loadPlayerId,
  MAX_NAME_LENGTH,
  savePlayerName,
} from "../../storage/playerId";
import { ControlsHelp } from "../components/ControlsHelp";
import { HistoryPanel } from "../components/HistoryPanel";
import { RankingPanel } from "../components/RankingPanel";
import { ScenarioPanel } from "../components/ScenarioPanel";
import { SpriteButton } from "../components/SpriteButton";
import { loadLastResult } from "../../storage/lastResult";
import { formatTime } from "../formatTime";

interface MenuScreenProps {
  options: GameOptions;
  onPlay: () => void;
  onOptions: () => void;
}

type Tab = "ranking" | "history";

export function MenuScreen({ options, onPlay, onOptions }: MenuScreenProps) {
  const [tab, setTab] = useState<Tab>("ranking");
  const [playerId, setPlayerId] = useState(() => loadPlayerId());
  const [draft, setDraft] = useState(playerId);
  const [lastResult] = useState(() => loadLastResult());

  function commitName() {
    const saved = savePlayerName(draft);
    setPlayerId(saved);
    setDraft(saved);
  }

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
        <div className="sprite f-panel card menu-card scale-lg">
          <input
            className="name-input"
            type="text"
            value={draft}
            maxLength={MAX_NAME_LENGTH}
            placeholder="Your name"
            aria-label="Your name"
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitName}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
          />
          <SpriteButton
            onClick={() => {
              commitName();
              onPlay();
            }}
          >
            Play
          </SpriteButton>
          <SpriteButton variant="secondary" onClick={onOptions}>
            Options
          </SpriteButton>
          <ControlsHelp />
        </div>
      </div>

      <div className="scores">
        {lastResult && (
          <p className="last-match">
            Last battle: {lastResult.score}{" "}
            {lastResult.score === 1 ? "point" : "points"} in{" "}
            {formatTime(lastResult.secondsPlayed)} ·{" "}
            {lastResult.reason === "time" ? "time's up" : "ship destroyed"}
          </p>
        )}
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
