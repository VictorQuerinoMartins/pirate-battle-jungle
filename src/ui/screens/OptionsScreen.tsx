import {
  optionLimits,
  sanitizeOptions,
  type GameOptions,
} from "../../game/core/options";
import { formatTime } from "../formatTime";
import { SpriteButton } from "../components/SpriteButton";

interface OptionsScreenProps {
  options: GameOptions;
  onChange: (options: GameOptions) => void;
  onBack: () => void;
}

interface RowProps {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
}

function Row({ label, value, onMinus, onPlus }: RowProps) {
  return (
    <div className="option-row">
      <span className="option-label">{label}</span>
      <button
        type="button"
        className="btn-round"
        onClick={onMinus}
        aria-label={`Decrease ${label}`}
      >
        <span className="sprite f-icon-minus" aria-hidden="true" />
      </button>
      <span className="option-value">{value}</span>
      <button
        type="button"
        className="btn-round"
        onClick={onPlus}
        aria-label={`Increase ${label}`}
      >
        <span className="sprite f-icon-plus" aria-hidden="true" />
      </button>
    </div>
  );
}

export function OptionsScreen({ options, onChange, onBack }: OptionsScreenProps) {
  const { durationSeconds, spawnIntervalSeconds } = optionLimits;

  // sanitizeOptions keeps the new value inside the allowed limits
  const changeDuration = (delta: number) =>
    onChange(
      sanitizeOptions({
        ...options,
        durationSeconds: options.durationSeconds + delta,
      }),
    );
  const changeSpawn = (delta: number) =>
    onChange(
      sanitizeOptions({
        ...options,
        spawnIntervalSeconds: options.spawnIntervalSeconds + delta,
      }),
    );

  return (
    <div className="scene">
      <div className="sprite f-panel card scale-lg">
        <h1 className="card-title">Options</h1>
        <Row
          label="Session time"
          value={formatTime(options.durationSeconds)}
          onMinus={() => changeDuration(-durationSeconds.step)}
          onPlus={() => changeDuration(durationSeconds.step)}
        />
        <Row
          label="Enemy spawn"
          value={`${options.spawnIntervalSeconds} s`}
          onMinus={() => changeSpawn(-spawnIntervalSeconds.step)}
          onPlus={() => changeSpawn(spawnIntervalSeconds.step)}
        />
        <SpriteButton variant="secondary" onClick={onBack}>
          Back
        </SpriteButton>
      </div>
    </div>
  );
}