export const SCENARIOS = [
  { id: "normal", label: "Normal" },
  { id: "empty", label: "Empty ranking and history" },
  { id: "many-pages", label: "Many ranking pages" },
  { id: "slow", label: "Slow (2.5 s)" },
  { id: "variable-latency", label: "Variable latency" },
  { id: "out-of-order", label: "Out-of-order responses" },
  { id: "timeout", label: "Timeout (never answers)" },
  { id: "network-error", label: "Connection failure" },
  { id: "client-error", label: "HTTP 400 on everything" },
  { id: "server-error", label: "HTTP 500 on everything" },
  { id: "read-failure", label: "Ranking and history fail" },
  { id: "write-outage", label: "Outage when registering a match" },
  {
    id: "timeout-after-register",
    label: "Timeout after registering (saved, but no answer)",
  },
] as const;

export type ScenarioId = (typeof SCENARIOS)[number]["id"];

const STORAGE_KEY = "pirate-battle:mock-scenario";

type ScenarioStorage = Pick<Storage, "getItem" | "setItem">;

export function isScenarioId(value: unknown): value is ScenarioId {
  return SCENARIOS.some((scenario) => scenario.id === value);
}

export function loadScenario(
  storage?: ScenarioStorage,
  search: string = window.location.search,
): ScenarioId {
  const fromUrl = new URLSearchParams(search).get("scenario");
  if (isScenarioId(fromUrl)) return fromUrl;

  try {
    const saved = (storage ?? localStorage).getItem(STORAGE_KEY);
    if (isScenarioId(saved)) return saved;
  } catch {
    // blocked storage: use the default
  }
  return "normal";
}

let current: ScenarioId = "normal";

export function getScenario(): ScenarioId {
  return current;
}

export function initScenario(storage?: ScenarioStorage): void {
  current = loadScenario(storage);
}

export function setScenario(id: ScenarioId, storage?: ScenarioStorage): void {
  current = id;
  try {
    (storage ?? localStorage).setItem(STORAGE_KEY, id);
  } catch {
    // the choice just will not survive a refresh
  }
}

export type Behavior =
  | { kind: "respond"; delayMs: number }
  | { kind: "hang" }
  | { kind: "network-error" }
  | { kind: "status"; status: number };

export function behaviorFor(
  scenario: ScenarioId,
  method: "read" | "write",
  callIndex: number,
  random: () => number,
): Behavior {
  switch (scenario) {
    case "slow":
      return { kind: "respond", delayMs: 2500 };
    case "variable-latency":
      return { kind: "respond", delayMs: 200 + random() * 2800 };
    case "out-of-order":
      return { kind: "respond", delayMs: callIndex % 2 === 0 ? 2500 : 100 };
    case "timeout":
      return { kind: "hang" };
    case "network-error":
      return { kind: "network-error" };
    case "client-error":
      return { kind: "status", status: 400 };
    case "server-error":
      return { kind: "status", status: 500 };
    case "read-failure":
      return method === "read"
        ? { kind: "status", status: 500 }
        : { kind: "respond", delayMs: 0 };
    case "write-outage":
      return method === "write"
        ? { kind: "network-error" }
        : { kind: "respond", delayMs: 0 };
    default:
      return { kind: "respond", delayMs: 0 };
  }
}