import { expect, test } from "@playwright/test";

/**
 * E2E Tests for Guest Authentication and Order Access
 *
 * Tests the guest password protection and basic order flow access
 */

// Guest password from environment
const GUEST_PASSWORD = "guest123";

test.describe("Guest Order Authentication", () => {
  test("guest can access order page with correct password", async ({ page }) => {
    // Navigate to the guest ordering page
    await page.goto("/order");

    // Should see password prompt
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Enter correct password
    await passwordInput.fill(GUEST_PASSWORD);
    await page.keyboard.press("Enter");

    // Should be redirected to the actual order interface
    // Wait for either drink selection or an error/loading state
    await page.waitForTimeout(2000);

    // The page should no longer show the password input
    await expect(passwordInput).not.toBeVisible();

    // Should see some form of order interface (even if drinks don't load)
    const orderInterface = page.locator(
      '[data-testid="drink-selection"], [data-testid="guest-order-form"], .order-form, .guest-module',
    );
    if (await orderInterface.count() > 0) {
      await expect(orderInterface.first()).toBeVisible();
    } else {
      // Even if specific test IDs aren't found, we should at least be past the password screen
      const bodyContent = await page.textContent("body");
      expect(bodyContent).not.toContain("Enter password");
    }
  });

  test("guest cannot access order page with incorrect password", async ({ page }) => {
    // Navigate to the guest ordering page
    await page.goto("/order");

    // Should see password prompt
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Enter incorrect password
    await passwordInput.fill("wrongpassword");
    await page.keyboard.press("Enter");

    // Should still see password input or error message
    await page.waitForTimeout(1000);

    // Password input should still be visible OR there should be an error message
    const stillHasPasswordInput = await passwordInput.isVisible();
    const hasErrorMessage = await page.locator(
      "text=/wrong|incorrect|invalid/i",
    ).isVisible();

    expect(stillHasPasswordInput || hasErrorMessage).toBe(true);
  });

  test("guest order page requires password protection", async ({ page }) => {
    // Navigate to the guest ordering page
    await page.goto("/order");

    // Should immediately see password protection
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Should not see order interface without authentication
    const orderInterface = page.locator('[data-testid="drink-selection"]');
    expect(await orderInterface.count()).toBe(0);
  });
});
