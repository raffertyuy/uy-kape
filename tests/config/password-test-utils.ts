/**
 * Password Test Utilities for Playwright E2E Tests
 *
 * Provides utilities for handling dynamic password configurations
 * based on environment variables in E2E tests
 */

import type { Page } from "@playwright/test";

/**
 * Configuration for password testing scenarios
 */
export interface PasswordTestConfig {
  guestPassword: string;
  adminPassword: string;
  bypassGuestPassword: boolean;
}

/**
 * Gets the current password test configuration from environment
 */
export const getPasswordTestConfig = (): PasswordTestConfig => {
  return {
    guestPassword: process.env.VITE_GUEST_PASSWORD || "guest123",
    adminPassword: process.env.VITE_ADMIN_PASSWORD || "admin456",
    bypassGuestPassword: process.env.VITE_GUEST_BYPASS_PASSWORD === "true",
  };
};

/**
 * Handles guest authentication flow with conditional bypass logic
 */
export const handleGuestAuthentication = async (page: Page): Promise<void> => {
  const config = getPasswordTestConfig();

  // Navigate to guest order page
  await page.goto("/order");

  // If bypass is enabled, we should go directly to the order interface
  if (config.bypassGuestPassword) {
    // Should NOT see password input when bypass is enabled
    const passwordInput = page.locator('input[type="password"]');

    // Wait a moment for page to load completely
    await page.waitForTimeout(1000);

    // Verify no password input is visible
    const passwordInputVisible = await passwordInput.isVisible();
    if (passwordInputVisible) {
      throw new Error(
        "Expected no password input when bypass is enabled, but password input was found",
      );
    }

    // Should see order interface directly
    const orderInterface = page.locator(
      '[data-testid="drink-selection"], [data-testid="guest-order-form"], .order-form, .guest-module',
    );

    // Wait for order interface to be visible
    await page.waitForTimeout(2000);

    const interfaceCount = await orderInterface.count();
    if (interfaceCount === 0) {
      // Check if we're at least past password screen by content
      const bodyContent = await page.textContent("body");
      if (
        bodyContent?.includes("Enter password") ||
        bodyContent?.includes("password")
      ) {
        throw new Error(
          "Expected to bypass password screen but still seeing password-related content",
        );
      }
    }
  } else {
    // Normal password authentication flow
    const passwordInput = page.locator('input[type="password"]');

    // Should see password input when bypass is disabled
    await passwordInput.waitFor({ state: "visible", timeout: 5000 });

    // Enter the guest password
    await passwordInput.fill(config.guestPassword);
    await page.keyboard.press("Enter");

    // Wait for authentication to process
    await page.waitForTimeout(2000);

    // Should be past password protection
    const passwordStillVisible = await passwordInput.isVisible();
    if (passwordStillVisible) {
      throw new Error(
        `Failed to authenticate with guest password: ${config.guestPassword}`,
      );
    }
  }
};

/**
 * Handles admin authentication flow (always requires password)
 */
export const handleAdminAuthentication = async (page: Page): Promise<void> => {
  const config = getPasswordTestConfig();

  // Navigate to admin page
  await page.goto("/admin");

  // Admin authentication always requires password (no bypass)
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.waitFor({ state: "visible", timeout: 5000 });

  // Enter the admin password
  await passwordInput.fill(config.adminPassword);
  await page.keyboard.press("Enter");

  // Wait for authentication to process
  await page.waitForTimeout(2000);

  // Should be past password protection
  const passwordStillVisible = await passwordInput.isVisible();
  if (passwordStillVisible) {
    throw new Error(
      `Failed to authenticate with admin password: ${config.adminPassword}`,
    );
  }
};

/**
 * Verifies that guest password protection is working as expected
 * based on current configuration
 */
export const verifyGuestPasswordProtection = async (
  page: Page,
): Promise<void> => {
  const config = getPasswordTestConfig();

  await page.goto("/order");
  await page.waitForTimeout(1000);

  if (config.bypassGuestPassword) {
    // When bypass is enabled, should NOT see password input
    const passwordInput = page.locator('input[type="password"]');
    const passwordInputVisible = await passwordInput.isVisible();

    if (passwordInputVisible) {
      throw new Error(
        "Expected no password protection when bypass is enabled, but password input was found",
      );
    }

    // Should see order interface or content indicating we're past authentication
    const bodyContent = await page.textContent("body");
    if (bodyContent?.includes("Enter password")) {
      throw new Error(
        "Expected to bypass password screen but still seeing password prompt",
      );
    }
  } else {
    // When bypass is disabled, should see password input
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.waitFor({ state: "visible", timeout: 5000 });

    // Should not see order interface without authentication
    const orderInterface = page.locator('[data-testid="drink-selection"]');
    const interfaceVisible = await orderInterface.isVisible();

    if (interfaceVisible) {
      throw new Error(
        "Expected password protection but order interface was immediately visible",
      );
    }
  }
};

/**
 * Gets test description suffix based on current configuration
 */
export const getConfigDescription = (): string => {
  const config = getPasswordTestConfig();
  return config.bypassGuestPassword
    ? " (bypass enabled)"
    : " (password required)";
};

/**
 * Checks if test should be skipped based on configuration
 */
export const shouldSkipPasswordTest = (
  testType: "bypass" | "password",
): boolean => {
  const config = getPasswordTestConfig();

  if (testType === "bypass" && !config.bypassGuestPassword) {
    return true; // Skip bypass tests when bypass is disabled
  }

  if (testType === "password" && config.bypassGuestPassword) {
    return true; // Skip password tests when bypass is enabled
  }

  return false;
};
