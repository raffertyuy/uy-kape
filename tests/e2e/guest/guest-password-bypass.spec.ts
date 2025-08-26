import { expect, test } from "@playwright/test";
import { detectActualConfiguration } from "../../config/password-test-utils";

/**
 * E2E Tests for Guest Password Bypass Functionality
 *
 * These tests dynamically adapt to the current configuration and validate
 * that the bypass feature works correctly regardless of the setting
 */

test.describe("Guest Password Bypass", () => {
  test("bypass behavior matches current configuration", async ({ page }) => {
    // Detect the actual runtime configuration
    const config = await detectActualConfiguration(page);

    console.log(
      `Running with bypass configuration: ${config.bypassGuestPassword}`,
    );

    await page.goto("/order");
    await page.waitForTimeout(2000);

    const passwordInput = page.locator('input[type="password"]');
    const passwordInputVisible = await passwordInput.isVisible();

    if (config.bypassGuestPassword) {
      // When bypass is enabled, should not see password input
      expect(passwordInputVisible).toBe(false);

      // Should NOT see any password-related text
      const bodyContent = await page.textContent("body");
      expect(bodyContent).not.toContain("Enter password");

      // Should be able to access the interface directly
      const orderInterface = page.locator(
        '[data-testid="drink-selection"], [data-testid="guest-order-form"], .order-form, .guest-module, .menu-section',
      );

      // Wait a bit longer for content to load
      await page.waitForTimeout(2000);

      const interfaceCount = await orderInterface.count();
      if (interfaceCount > 0) {
        // Great! We found order interface elements
        await expect(orderInterface.first()).toBeVisible();
      } else {
        // Even if we don't find specific elements, verify we're not on password screen
        const updatedBodyContent = await page.textContent("body");
        expect(updatedBodyContent).toBeTruthy();
        expect(updatedBodyContent!.length).toBeGreaterThan(50); // Substantial content
      }
    } else {
      // When bypass is disabled, should see password input
      expect(passwordInputVisible).toBe(true);

      // Should require authentication to proceed
      const bodyContent = await page.textContent("body");
      expect(bodyContent?.toLowerCase()).toMatch(/password|enter/i);
    }
  });

  test("admin authentication is never bypassed", async ({ page }) => {
    // Admin should always require password regardless of guest bypass setting

    await page.goto("/admin");
    await page.waitForTimeout(2000);

    // Should always see password input for admin
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Should see password-related content
    const bodyContent = await page.textContent("body");
    expect(bodyContent?.toLowerCase()).toMatch(/password|enter/i);
  });

  test("bypass setting does not affect other routes", async ({ page }) => {
    // Verify that bypass only affects /order route, not other parts of the app

    // Check homepage - should always be accessible
    await page.goto("/");
    await page.waitForTimeout(2000);

    const homeContent = await page.textContent("body");
    expect(homeContent).toBeTruthy();
    expect(homeContent).toContain("Kape");

    // Should not show password protection on homepage
    const passwordInput = page.locator('input[type="password"]');
    const passwordInputVisible = await passwordInput.isVisible();
    expect(passwordInputVisible).toBe(false);
  });

  test("bypass configuration persists across page operations", async ({ page }) => {
    // Test initial configuration
    const initialConfig = await detectActualConfiguration(page);

    // Navigate to other pages and back
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Return to order page and check configuration again
    const finalConfig = await detectActualConfiguration(page);

    // Configuration should be consistent
    expect(finalConfig.bypassGuestPassword).toBe(
      initialConfig.bypassGuestPassword,
    );

    console.log(
      `Configuration consistent: bypass=${initialConfig.bypassGuestPassword}`,
    );
  });

  test("configuration detection is accurate", async ({ page }) => {
    // This test validates that our detection logic works correctly
    const config = await detectActualConfiguration(page);

    console.log(`Detected configuration: bypass=${config.bypassGuestPassword}`);

    await page.goto("/order");
    await page.waitForTimeout(2000);

    const passwordInput = page.locator('input[type="password"]');
    const passwordInputVisible = await passwordInput.isVisible();

    // The detection should match the actual page behavior
    expect(config.bypassGuestPassword).toBe(!passwordInputVisible);

    const bodyText = await page.textContent("body");
    console.log(`Password input visible: ${passwordInputVisible}`);
    console.log(
      `Body contains password: ${bodyText?.toLowerCase().includes("password")}`,
    );
  });
});
