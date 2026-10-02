import { expect, test } from "@playwright/test";
import { startMatch, useShortMatch } from "./helpers.js";

test.describe("touch controls", () => {
  test.skip(({ isMobile }) => !isMobile, "only on the phone project");

  test.beforeEach(async ({ page }) => {
    await useShortMatch(page);
    await startMatch(page);
  });

  test("shows the touch buttons and pauses with the pause button", async ({
    page,
  }) => {
    for (const name of [
      "Turn left",
      "Turn right",
      "Fire left broadside",
      "Fire front cannon",
      "Fire right broadside",
      "Sail forward",
    ]) {
      await expect(page.getByRole("button", { name })).toBeVisible();
    }

    await page.getByRole("button", { name: "Pause" }).click();

    await expect(page.getByRole("dialog", { name: "Paused" })).toBeVisible();
  });

  test("asks for landscape when the phone is held upright", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await expect(page.getByRole("alert")).toContainText(
      "Rotate your device to landscape",
    );

    await page.setViewportSize({ width: 915, height: 412 });
    await expect(page.getByRole("alert")).toBeHidden();
  });
});