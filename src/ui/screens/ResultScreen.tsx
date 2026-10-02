import type { MutationStatus } from "@tanstack/react-query";
import { formatTime } from "../formatTime";
import type { MatchResult } from "../matchResult";
import { SpriteButton } from "../components/SpriteButton";

interface ResultScreenProps {
  result: MatchResult;
  saveStatus: MutationStatus;
  onRetry: () => void;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export function ResultScreen({
  result,
  saveStatus,
  onRetry,
  onPlayAgain,
  onMainMenu,
}: ResultScreenProps) {
  const title = result.reason === "time" ? "TIME'S UP" : "SHIP DESTROYED";

  return (
    <div className="scene">
      <div className="sprite f-panel card result-card scale-lg">
        <h1 className="card-title">{title}</h1>
        <p className="result-score">
          <span className="sprite f-icon-score" aria-hidden="true" />
          Score {result.score}
        </p>
        <p className="result-time">
          <span className="sprite f-icon-time" aria-hidden="true" />
          Time played {formatTime(result.secondsPlayed)}
        </p>

        {saveStatus === "error" ? (
          <div role="alert" className="result-alert">
            <p>Could not save this match. It is kept and will be sent again.</p>
            <SpriteButton variant="secondary" onClick={onRetry}>
              Try again
            </SpriteButton>
          </div>
        ) : (
          <p role="status">
            {saveStatus === "success" ? "Match saved." : "Saving match..."}
          </p>
        )}

        <SpriteButton onClick={onPlayAgain}>Play again</SpriteButton>
        <SpriteButton variant="secondary" onClick={onMainMenu}>
          Main menu
        </SpriteButton>
      </div>
    </div>
  );
}
