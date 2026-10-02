import { delay, http, HttpResponse } from "msw";
import { paginate, rankRecords } from "../api/ranking";
import type { MatchRecord } from "../api/types";
import { defaultOptions } from "../game/core/options";
import type { MatchDb } from "./db";
import { createFixtureRecords } from "./fixtures";
import { behaviorFor, getScenario } from "./scenarios";

// Extra players for the "many pages" scenario.
const extraRecords = createFixtureRecords(150, defaultOptions, "extra");

function numberParam(
  params: URLSearchParams,
  name: string,
  fallback: number,
): number {
  const value = Number(params.get(name));
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function looksLikeMatchRecord(value: unknown): value is MatchRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Partial<MatchRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.playerId === "string" &&
    typeof record.score === "number" &&
    typeof record.playedAt === "string"
  );
}

let calls = 0;

// Applies the current scenario to a request. Returns a failure response when
// the scenario says so, or null when the request may continue normally.
async function applyScenario(
  method: "read" | "write",
): Promise<Response | null> {
  const behavior = behaviorFor(getScenario(), method, calls++, Math.random);

  switch (behavior.kind) {
    case "hang":
      await delay("infinite");
      return null;
    case "network-error":
      return HttpResponse.error();
    case "status":
      return HttpResponse.json(
        { error: "Mock failure" },
        { status: behavior.status },
      );
    case "respond":
      if (behavior.delayMs > 0) await delay(behavior.delayMs);
      return null;
  }
}

function recordsForScenario(db: MatchDb): MatchRecord[] {
  switch (getScenario()) {
    case "empty":
      return [];
    case "many-pages":
      return [...db.all(), ...extraRecords];
    default:
      return db.all();
  }
}

// The "*/" prefix makes the handlers work on any origin
// (the browser, Node tests and the deployed site).
export function createHandlers(db: MatchDb) {
  return [
    http.get("*/api/ranking", async ({ request }) => {
      const failure = await applyScenario("read");
      if (failure) return failure;

      const params = new URL(request.url).searchParams;
      const config = {
        durationSeconds: numberParam(params, "durationSeconds", 120),
        spawnIntervalSeconds: numberParam(params, "spawnIntervalSeconds", 3),
      };
      const ranking = rankRecords(recordsForScenario(db), config);
      return HttpResponse.json(
        paginate(
          ranking,
          numberParam(params, "page", 1),
          numberParam(params, "pageSize", 10),
        ),
      );
    }),

    http.get("*/api/matches", async ({ request }) => {
      const failure = await applyScenario("read");
      if (failure) return failure;

      const params = new URL(request.url).searchParams;
      const playerId = params.get("playerId");
      const history = recordsForScenario(db)
        .filter((record) => playerId === null || record.playerId === playerId)
        .sort(
          (a, b) =>
            b.playedAt.localeCompare(a.playedAt) || a.id.localeCompare(b.id),
        );
      return HttpResponse.json(
        paginate(
          history,
          numberParam(params, "page", 1),
          numberParam(params, "pageSize", 10),
        ),
      );
    }),

    http.post("*/api/matches", async ({ request }) => {
      const failure = await applyScenario("write");
      if (failure) return failure;

      const body: unknown = await request.json();
      if (!looksLikeMatchRecord(body)) {
        return HttpResponse.json({ error: "Invalid match" }, { status: 400 });
      }

      const created = db.add(body);
      if (created && getScenario() === "timeout-after-register") {
        // The match was saved, but the answer never arrives. Sending it
        // again finds the same id, so nothing is duplicated.
        await delay("infinite");
      }
      return HttpResponse.json(body, { status: created ? 201 : 200 });
    }),
  ];
}