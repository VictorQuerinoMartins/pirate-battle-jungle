import { expect, test } from "@playwright/test";
import { finishMatch, startMatch, useShortMatch } from "./helpers.js";

test.describe("full match", () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await useShortMatch(page);
  });

  test("ends, shows the result and records one history entry", async ({
    page,
  }) => {
    await startMatch(page);
    await finishMatch(page);

    await expect(
      page.getByRole("heading", { name: /TIME'S UP|SHIP DESTROYED/ }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("Match saved.", {
      timeout: 15_000,
    });

    await page.getByRole("button", { name: "Main menu" }).click();
    await page.getByRole("tab", { name: "Match History" }).click();

    await expect(
      page.getByRole("region", { name: "Match history" }).getByRole("row"),
    ).toHaveCount(2); // header + 1 match
  });

  test("does not record a match that was abandoned", async ({ page }) => {
    await startMatch(page);
    await page.clock.resume();

    await page.reload();
    await page.getByRole("tab", { name: "Match History" }).click();

    await expect(
      page.getByText("You have not finished any match yet."),
    ).toBeVisible();
  });

  test("starts a fresh match with play again", async ({ page }) => {
    await startMatch(page);
    await finishMatch(page);
    await expect(page.getByRole("status")).toHaveText("Match saved.", {
      timeout: 15_000,
    });

    await page.getByRole("button", { name: "Play again" }).click();

    await expect(page.getByText("Score 0")).toBeVisible();
  });

  test("keeps the match when the api is down and sends it after recovery", async ({
    page,
  }) => {
    await startMatch(page, "&scenario=write-outage");
    await finishMatch(page);

    // 3 attempts fail before the screen shows the error
     await expect(page.getByText("Could not save this match")).toBeVisible({
      timeout: 20_000,
    });

    // the api is back (the scenario was only in the first url):
    // the pending match is sent when the app opens
    await page.goto("/");
    await page.getByRole("tab", { name: "Match History" }).click();

    await expect(
      page.getByRole("region", { name: "Match history" }).getByRole("row"),
    ).toHaveCount(2);
  });
});