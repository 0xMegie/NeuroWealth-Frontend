import { expect, test } from "@playwright/test";

test.describe("Wallet connect", () => {
  test("wallet connect button is visible on dashboard", async ({ page }) => {
    // Sign in first
    await page.goto("/login");
    await page.getByRole("button", { name: /continue with demo/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    // Check for wallet connect button
    const walletButton = page.locator('[data-qa="wallet-connect-button"]');
    await expect(walletButton).toBeVisible();
  });

  test("wallet connect button has correct data-qa attribute", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /continue with demo/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    const walletButton = page.locator('[data-qa="wallet-connect-button"]');
    await expect(walletButton).toHaveAttribute("data-qa", "wallet-connect-button");
  });

  test("wallet connect button shows connect text when not connected", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /continue with demo/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    const walletButton = page.locator('[data-qa="wallet-connect-button"]');
    await expect(walletButton).toContainText(/connect/i);
  });
});
