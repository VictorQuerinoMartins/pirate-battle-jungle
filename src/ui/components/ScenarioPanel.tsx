import { useState } from "react";
import { resetMockData } from "../../mocks/browser";
import {
  SCENARIOS,
  getScenario,
  isScenarioId,
  setScenario,
} from "../../mocks/scenarios";
import { clearPendingMatches } from "../../storage/pendingMatches";

export function ScenarioPanel() {
  const [scenario, setScenarioState] = useState(getScenario);

  function handleChange(value: string) {
    if (!isScenarioId(value)) return;
    setScenario(value);
    setScenarioState(value);
  }

  function handleReset() {
    resetMockData();
    clearPendingMatches();
    window.location.reload(); // start again with clean data and caches
  }

  return (
    <details>
      <summary>Mock API scenarios</summary>
      <label>
        Scenario{" "}
        <select
          value={scenario}
          onChange={(event) => handleChange(event.target.value)}
        >
          {SCENARIOS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>{" "}
      <button type="button" onClick={handleReset}>
        Reset mock data
      </button>
    </details>
  );
}