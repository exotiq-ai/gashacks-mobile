import { expect, type Page, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
});

async function completeFirstLaunch(page: Page) {
  await expect(page.getByText("Safety First")).toBeVisible();
  await page.getByText(/I Understand/).click();
  await expect(page.getByText("Add Your Ride")).toBeVisible();
  await page.getByText("Skip").click();
}

test("completes onboarding and reaches the main tabs", async ({ page }) => {
  await completeFirstLaunch(page);

  await expect(page.getByRole("heading", { name: "Hub" })).toBeVisible();
  await expect(page.getByRole("tab", { name: /Calculator/ })).toBeVisible();
  await expect(page.getByRole("tab", { name: /Garage/ })).toBeVisible();
  await expect(page.getByRole("tab", { name: /Stations/ })).toBeVisible();
});

test("renders paywall restore path without configured products", async ({ page }) => {
  await completeFirstLaunch(page);
  await page.goto("/paywall", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("Go Pro")).toBeVisible();
  await expect(page.getByText(/Restore Purchases/)).toBeVisible();
  await expect(page.getByText("Privacy Policy")).toBeVisible();
  await expect(page.getByText("Terms of Service")).toBeVisible();
  await expect(page.getByText("Pro Enabled for Testing")).toHaveCount(0);
  await expect(page.getByText(/\$2\.99|\$19\.99|\$1\.67\/mo|SAVE 44/)).toHaveCount(0);
});

test("station finder accepts manual searches and shows a result state", async ({ page }) => {
  await completeFirstLaunch(page);
  await page.goto("/stations", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("Station Finder")).toBeVisible();
  await page.getByPlaceholder("City, state, or ZIP").fill("80202");
  await page.getByText("Search This Area").click();

  await expect(page.getByText(/Near: 80202|No stations found|Live station lookup failed/)).toBeVisible();
});

test("settings exposes legal, subscription, and account deletion affordances", async ({ page }) => {
  await completeFirstLaunch(page);
  await page.goto("/settings", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByText("Subscription", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Privacy Policy")).toBeVisible();
  await expect(page.getByText("Terms of Service")).toBeVisible();
  await expect(page.getByText(/Delete Account/)).toBeVisible();
});
