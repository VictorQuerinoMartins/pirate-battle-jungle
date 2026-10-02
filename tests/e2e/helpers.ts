import { expect, type Page } from "@playwright/test";

export const SEED = 12345;
export const MATCH_SECONDS = 60;

// One-minute match with a spawn every 3 seconds.
// Written before the app loads, so the app reads it at startup.
export async function useShortMatch(page: Page): Promise<void> {
  await page.addInitScript(
    (options) => {
      localStorage.setItem("pirate-battle:options", JSON.stringify(options));
    },
    { durationSeconds: MATCH_SECONDS, spawnIntervalSeconds: 3 },
  );
}

// Fake clock + fixed seed + test controls: the match is the same on every run.
// `query` is added to the url, for example "&scenario=write-outage".
export async function startMatch(page: Page, query = ""): Promise<void> {
  await page.clock.install();
  await page.goto(`/?seed=${SEED}&testControls${query}`);
  await page.getByRole("button", { name: "Play" }).click();
  await expect(page.getByText("Score 0")).toBeVisible();

  // Freeze the real loop (animation frames) so only `advance` moves the
  // match. The fake clock keeps running while this code talks to the browser,
  // so the target must be far enough ahead.
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 5_000);
}

// Plays `seconds` of the simulation at once, without drawing every frame.
// It does nothing while the game is paused.
export async function advance(page: Page, seconds: number): Promise<void> {
  await page.evaluate((amount) => {
    const hooks = (
      window as unknown as {
        __pirateBattle?: { advance: (seconds: number) => void };
      }
    ).__pirateBattle;
    if (!hooks) throw new Error("Test controls are not available");
    hooks.advance(amount);
  }, seconds);
}

// Plays the whole match, then lets time flow again so the mock api delays and
// the query retries can finish.
export async function finishMatch(page: Page): Promise<void> {
  await advance(page, MATCH_SECONDS + 1);
  await page.clock.resume();
  await expect(
    page.getByRole("heading", { name: /TIME'S UP|SHIP DESTROYED/ }),
  ).toBeVisible();
}