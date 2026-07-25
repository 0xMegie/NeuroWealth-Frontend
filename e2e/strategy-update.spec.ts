import { expect, test } from "@playwright/test";

test.describe("Strategy update", () => {
  test("strategy page renders all strategy options", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /continue with demo/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    const strategyRadios = page.getByRole("radio");
    const count = await strategyRadios.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("strategy page shows heading and description", async ({ page }) => {
    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /strategy/i })).toBeVisible();
    await expect(page.getByText(/choose/i)).toBeVisible();
  });

  test("strategy page has radiogroup with investment strategies", async ({ page }) => {
    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    const radiogroup = page.getByRole("radiogroup", { name: /investment strategy/i });
    await expect(radiogroup).toBeVisible();
  });

  test("strategy page shows active strategy indicator", async ({ page }) => {
    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    const activeCheck = page.getByLabel(/currently active/i);
    await expect(activeCheck).toBeVisible();
  });

  test("strategy cards display APY and risk level", async ({ page }) => {
    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/% APY/).first()).toBeVisible();
    await expect(page.getByText(/risk/i).first()).toBeVisible();
  });
});
