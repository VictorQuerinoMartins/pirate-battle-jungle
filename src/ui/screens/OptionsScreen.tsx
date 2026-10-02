import {
  optionLimits,
  sanitizeOptions,
  type GameOptions,
} from "../../game/core/options";
import { formatTime } from "../formatTime";

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
  const buttonStyle = { width: 40, height: 40, fontSize: 22, cursor: "pointer" };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <span style={{ width: 160, textAlign: "left" }}>{label}</span>
      <button
        type="button"
        onClick={onMinus}
        aria-label={`Decrease ${label}`}
        style={buttonStyle}
      >
        -
      </button>
      <span style={{ width: 70 }}>{value}</span>
      <button
        type="button"
        onClick={onPlus}
        aria-label={`Increase ${label}`}
        style={buttonStyle}
      >
        +
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
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        background: "#102a43",
        color: "#fff",
      }}
    >
      <h1 style={{ margin: 0 }}>Options</h1>
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
      <button
        type="button"
        onClick={onBack}
        style={{ padding: "10px 28px", fontSize: 18, cursor: "pointer" }}
      >
        Back
      </button>
    </div>
  );
}