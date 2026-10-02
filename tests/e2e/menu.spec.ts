import { expect, test } from "@playwright/test";

test("shows the menu with the first page of the ranking", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Pirate Battle" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Play" })).toBeVisible();

  const ranking = page.getByRole("region", { name: "Ranking" });
  await expect(ranking.getByRole("row")).toHaveCount(11); // header + 10 players
  await expect(ranking.getByRole("row").nth(1)).toContainText("Captain 14");
  await expect(ranking.getByText("Page 1 of 3")).toBeVisible();
});

test("moves between the ranking pages", async ({ page }) => {
  await page.goto("/");
  const ranking = page.getByRole("region", { name: "Ranking" });

  await ranking.getByRole("button", { name: "Next" }).click();

  await expect(ranking.getByText("Page 2 of 3")).toBeVisible();
  await expect(ranking.getByRole("button", { name: "Previous" })).toBeEnabled();
});

test("keeps the options after a reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Options" }).click();

  await page.getByRole("button", { name: "Decrease Session time" }).click();
  await expect(page.getByText("1:50")).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Options" }).click();

  await expect(page.getByText("1:50")).toBeVisible();
});