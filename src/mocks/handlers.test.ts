import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { apiClient } from "../api/client";
import { fetchHistory, fetchRanking, postMatch } from "../api/matchesApi";
import type { MatchRecord } from "../api/types";
import { defaultOptions } from "../game/core/options";
import { createMatchDb } from "./db";
import { createFixtureRecords } from "./fixtures";
import { createHandlers } from "./handlers";

const db = createMatchDb(createFixtureRecords(25));
const server = setupServer(...createHandlers(db));

const myMatch: MatchRecord = {
  id: "mine-1",
  playerId: "me",
  playedAt: "2026-10-01T12:00:00.000Z",
  score: 99,
  durationSeconds: 120,
  reason: "time",
  config: defaultOptions,
};

beforeAll(() => {
  apiClient.defaults.baseURL = "http://localhost/api";
  server.listen({ onUnhandledFrame: "error" });
});
afterEach(() => db.reset());
afterAll(() => server.close());

describe("mock api", () => {
  it("returns the ranking one page at a time, best score first", async () => {
    const page = await fetchRanking(defaultOptions, 1);

    expect(page.items).toHaveLength(10);
    expect(page.total).toBe(25);
    expect(page.items[0]?.position).toBe(1);
    const scores = page.items.map((entry) => entry.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it("returns a shorter last page", async () => {
    const page = await fetchRanking(defaultOptions, 3);

    expect(page.items).toHaveLength(5);
  });

  it("shows a registered match in the history and in the ranking", async () => {
    await postMatch(myMatch);

    const history = await fetchHistory("me", 1);
    const ranking = await fetchRanking(defaultOptions, 1);

    expect(history.items.map((item) => item.id)).toEqual(["mine-1"]);
    expect(ranking.items[0]?.id).toBe("mine-1");
  });

  it("does not duplicate a match that is sent twice", async () => {
    await postMatch(myMatch);
    await postMatch(myMatch);

    const history = await fetchHistory("me", 1);

    expect(history.total).toBe(1);
  });
});
