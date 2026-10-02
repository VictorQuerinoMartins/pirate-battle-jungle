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
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <span style={{ width: 160, textAlign: "left" }}>{label}</span>
      <button type