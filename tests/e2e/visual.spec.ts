import { expect, test } from "@playwright/test";
import { finishMatch, startMatch, useShortMatch } from "./helpers.js";

test("menu", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Page 1 of 3")).toBeVisible();

  // a new browser gets a random player name, so the field is masked
  await expect(page).toHaveScreenshot("menu.png", {
    fullPage: true,
    mask: [page.getByLabel("Your name")],
  });
});

test("arena at the start of a match", async ({ page }) => {
  await useShortMatch(page);
  await startMatch(page);

  // only the canvas: the clock is paused, so the arena does not move
  await expect(page.locator("canvas")).toHaveScreenshot("arena.png");
});

test("result screen", async ({ page }) => {
  test.setTimeout(120_000);
  await useShortMatch(page);
  await startMatch(page);
  await finishMatch(page);
  await expect(page.getByRole("status")).toHaveText("Match saved.", {
    timeout: 15_000,
  });

  // the title and the time can change a little with the frame the clock stopped on
  await expect(page).toHaveScreenshot("result.png", {
    mask: [page.getByRole("heading"), page.getByText(/^Time played/)],
  });
});