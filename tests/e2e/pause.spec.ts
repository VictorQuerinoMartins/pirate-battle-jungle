import { expect, test } from "@playwright/test";
import { advance, startMatch, useShortMatch } from "./helpers.js";

test.describe("pause", () => {
  test.beforeEach(async ({ page }) => {
    await useShortMatch(page);
    await startMatch(page);
  });

  test("freezes the match and resumes only on a player action", async ({
    page,
  }) => {
    const time = page.getByText(/^\d:\d\d$/);
    const dialog = page.getByRole("dialog", { name: "Paused" });
    const resume = page.getByRole("button", { name: "Resume" });
    await expect(time).toHaveText("1:00");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await expect(resume).toBeFocused();

    await advance(page, 5);
    await expect(time).toHaveText("1:00");

    await resume.click();
    await expect(dialog).toBeHidden();

    await advance(page, 3);
    await expect(time).toHaveText(/^0:5[6-8]$/); // only the 3 s after resuming
  });

  test("pauses by itself when the window loses focus", async ({ page }) => {
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));

    await expect(page.getByRole("dialog", { name: "Paused" })).toBeVisible();
  });
});
