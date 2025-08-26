import { expect, test } from "@playwright/test";
import {
  detectActualConfiguration,
  handleGuestAuthentication,
  verifyGuestPasswordProtection,
} from "../../config/password-test-utils";

/**
 * E2E Tests for Guest Authentication and Order Access
 *
 * Tests the guest password protection and basic order flow access
 * Dynamically adapts to VITE_GUEST_BYPASS_PASSWORD environment variable
 */

test.describe("Guest Order Authentication", () => {
  test("guest can access order page with authentication", async ({ page }) => {
    // Get the actual runtime configuration
    const config = await detectActualConfiguration(page);

    // Use the dynamic authentication handler that adapts to bypass configuration
    await handleGuestAuthentication(page);

    // After authentication (or bypass), verify we can access the order interface
    // The page should no longer show password input
    const passwordInput = page.locator('input[type="password"]');
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

    console.log(
      `Test completed with configuration: bypass=${config.bypassGuestPassword}`,
    );
  });

  test("guest cannot access order page with incorrect password", async ({ page }) => {
    // First detect if password protection is active
    await page.goto("/order");
    await page.waitForTimeout(2000);

    const passwordInput = page.locator('input[type="password"]');
    const passwordInputVisible = await passwordInput.isVisible();

    // Skip this test if bypass is enabled (no password required)
    test.skip(
      !passwordInputVisible,
      "Skipping password test - bypass is enabled",
    );

    // If we reach here, password protection is active
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

  test("guest order page respects password protection configuration", async ({ page }) => {
    // Use the dynamic verification that adapts to bypass configuration
    await verifyGuestPasswordProtection(page);
  });
});
