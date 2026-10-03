import { expect, type Page } from "@playwright/test";

export const SEED = 12345;
export const MATCH_SECONDS = 60;

export async function useShortMatch(page: Page): Promise<void> {
  await page.addInitScript(
    (options) => {
      localStorage.setItem("pirate-battle:options", JSON.stringify(options));
    },
    { durationSeconds: MATCH_SECONDS, spawnIntervalSeconds: 3 },
  );
}

export async function startMatch(page: Page, query = ""): Promise<void> {
  await page.clock.install();
  await page.goto(`/?seed=${SEED}&testControls${query}`);
  await page.getByRole("button", { name: "Play" }).click();
  await expect(page.getByText("Score 0")).toBeVisible({ timeout: 20_000 });

  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 60_000);
}

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

export async function finishMatch(page: Page): Promise<void> {
  await advance(page, MATCH_SECONDS + 1);
  await page.clock.resume();
  await expect(
    page.getByRole("heading", { name: /TIME'S UP|SHIP DESTROYED/ }),
  ).toBeVisible();
}