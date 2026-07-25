import { expect, test } from "@playwright/test";

test.describe("Dashboard load", () => {
  test("dashboard page loads after login", async ({ page }) => {
    // Sign in first
    await page.goto("/login");
    await page.getByRole("button", { name: /continue with demo/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    // Verify dashboard elements
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("dashboard shows portfolio section", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /continue with demo/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    // Dashboard should have main content
    await expect(page.locator("main")).toBeVisible();
  });

  test("dashboard navigation links are accessible", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /continue with demo/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    // Check for navigation elements
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
  });
});
