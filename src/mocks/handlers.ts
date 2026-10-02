import { http, HttpResponse } from "msw";
import { paginate, rankRecords } from "../api/ranking";
import type { MatchRecord } from "../api/types";
import type { MatchDb } from "./db";

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


export function createHandlers(db: MatchDb) {
  return [
    http.get("*/api/ranking", ({ request }) => {
      const params = new URL(request.url).searchParams;
      const config = {
        durationSeconds: numberParam(params, "durationSeconds", 120),
        spawnIntervalSeconds: numberParam(params, "spawnIntervalSeconds", 3),
      };
      const ranking = rankRecords(db.all(), config);
      return HttpResponse.json(
        paginate(
          ranking,
          numberParam(params, "page", 1),
          numberParam(params, "pageSize", 10),
        ),
      );
    }),

    http.get("*/api/matches", ({ request }) => {
      const params = new URL(request.url).searchParams;
      const playerId = params.get("playerId");
      const history = db
        .all()
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
      const body: unknown = await request.json();
      if (!looksLikeMatchRecord(body)) {
        return HttpResponse.json({ error: "Invalid match" }, { status: 400 });
      }
      const created = db.add(body);
      return HttpResponse.json(body, { status: created ? 201 : 200 });
    }),
  ];
}