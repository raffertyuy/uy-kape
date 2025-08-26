import { expect, test } from "@playwright/test";
import {
  getPasswordTestConfig,
  shouldSkipPasswordTest,
} from "../../config/password-test-utils";

/**
 * E2E Tests for Guest Password Bypass Functionality
 *
 * These tests specifically validate the guest password bypass feature
 * when VITE_GUEST_BYPASS_PASSWORD=true
 */

test.describe("Guest Password Bypass", () => {
  test("bypass allows direct access to guest ordering without password", async ({ page }) => {
    // Only run this test when bypass is enabled
    test.skip(
      shouldSkipPasswordTest("bypass"),
      "Skipping bypass test - bypass is disabled",
    );

    const config = getPasswordTestConfig();
    expect(config.bypassGuestPassword).toBe(true);

    // Navigate to guest order page
    await page.goto("/order");

    // Wait for page to fully load
    await page.waitForTimeout(1000);

    // Should NOT see any password input when bypass is enabled
    const passwordInput = page.locator('input[type="password"]');
    const passwordInputVisible = await passwordInput.isVisible();
    expect(passwordInputVisible).toBe(false);

    // Should NOT see any password-related text
    const bodyContent = await page.textContent("body");
    expect(bodyContent).not.toContain("Enter password");
    expect(bodyContent).not.toContain("Password");
    expect(bodyContent).not.toContain("password");

    // Should see order interface content or at minimum not be blocked
    // Check for positive indicators that we're in the order interface
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
      // by checking that the page has substantial content (not just password prompt)
      const updatedBodyContent = await page.textContent("body");
      expect(updatedBodyContent).toBeTruthy();
      expect(updatedBodyContent!.length).toBeGreaterThan(50); // Substantial content
    }
  });

  test("bypass configuration can be toggled effectively", async ({ page }) => {
    // This test verifies that the bypass configuration is properly read
    // and that the system behaves differently based on the setting

    const config = getPasswordTestConfig();

    // Navigate to guest order page
    await page.goto("/order");
    await page.waitForTimeout(1000);

    const passwordInput = page.locator('input[type="password"]');
    const passwordInputVisible = await passwordInput.isVisible();

    if (config.bypassGuestPassword) {
      // When bypass is enabled, should not see password input
      expect(passwordInputVisible).toBe(false);

      // Should be able to interact with the page immediately
      const bodyContent = await page.textContent("body");
      expect(bodyContent).not.toContain("Enter password");
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
    await page.waitForTimeout(1000);

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
    await page.waitForTimeout(1000);

    const homeContent = await page.textContent("body");
    expect(homeContent).toBeTruthy();
    expect(homeContent).toContain("Kape");

    // Should not show password protection on homepage
    const passwordInput = page.locator('input[type="password"]');
    const passwordInputVisible = await passwordInput.isVisible();
    expect(passwordInputVisible).toBe(false);
  });

  test("bypass configuration persists across page reloads", async ({ page }) => {
    // Only run this test when bypass is enabled
    test.skip(
      shouldSkipPasswordTest("bypass"),
      "Skipping bypass test - bypass is disabled",
    );

    // Navigate to guest order page
    await page.goto("/order");
    await page.waitForTimeout(1000);

    // Verify bypass is working on first load
    const passwordInput = page.locator('input[type="password"]');
    expect(await passwordInput.isVisible()).toBe(false);

    // Reload the page
    await page.reload();
    await page.waitForTimeout(1000);

    // Verify bypass still works after reload
    expect(await passwordInput.isVisible()).toBe(false);

    // Body should not contain password prompts
    const bodyContent = await page.textContent("body");
    expect(bodyContent).not.toContain("Enter password");
  });

  test("environment variable controls bypass behavior", async ({ page }) => {
    // This test documents the expected behavior based on environment variable
    const config = getPasswordTestConfig();

    console.log(
      `Running with VITE_GUEST_BYPASS_PASSWORD: ${config.bypassGuestPassword}`,
    );

    await page.goto("/order");
    await page.waitForTimeout(1000);

    const passwordInput = page.locator('input[type="password"]');
    const passwordInputVisible = await passwordInput.isVisible();

    // Log the actual behavior for debugging
    const bodyText = await page.textContent("body");
    console.log(`Password input visible: ${passwordInputVisible}`);
    console.log(
      `Body contains password: ${bodyText?.toLowerCase().includes("password")}`,
    );

    // Verify behavior matches configuration
    if (config.bypassGuestPassword) {
      expect(passwordInputVisible).toBe(false);
    } else {
      expect(passwordInputVisible).toBe(true);
    }
  });
});
