import { expect, test } from "@playwright/test";

test("shows an empty ranking", async ({ page }) => {
  await page.goto("/?scenario=empty");

  await expect(
    page.getByText("No matches yet for these options."),
  ).toBeVisible();
});

test("shows many ranking pages", async ({ page }) => {
  await page.goto("/?scenario=many-pages");

  await expect(page.getByText("Page 1 of 18")).toBeVisible();
});

test("shows a loading state while the api is slow", async ({ page }) => {
  await page.goto("/?scenario=slow");

  await expect(page.getByRole("status")).toContainText("Loading ranking");
  await expect(
    page.getByRole("region", { name: "Ranking" }).getByRole("row"),
  ).toHaveCount(11, { timeout: 15_000 });
});

test("shows an error and recovers after the api comes back", async ({
  page,
}) => {
  await page.goto("/?scenario=server-error");

  // the query is tried 3 times before it gives up
  await expect(page.getByRole("alert")).toContainText(
    "Could not load the ranking",
    { timeout: 20_000 },
  );

  await page.getByText("Mock API scenarios").click();
  await page.getByLabel("Scenario").selectOption("normal");
  await page.getByRole("button", { name: "Try again" }).click();

  await expect(
    page.getByRole("region", { name: "Ranking" }).getByRole("row"),
  ).toHaveCount(11);
});