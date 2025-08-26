/**
 * Password Test Utilities for Playwright E2E Tests
 *
 * Provides utilities for handling dynamic password configurations
 * based on actual runtime behavior in E2E tests
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
 * Detects the actual runtime configuration by testing the page behavior
 * This is more reliable than reading environment variables in test context
 */
export const detectActualConfiguration = async (
  page: Page,
): Promise<PasswordTestConfig> => {
  // Navigate to guest order page to test behavior
  await page.goto("/order");
  await page.waitForTimeout(2000); // Give page time to load

  // Check if password input is present
  const passwordInput = page.locator('input[type="password"]');
  const passwordInputVisible = await passwordInput.isVisible();

  return {
    guestPassword: "guest123", // Static for tests
    adminPassword: "admin456", // Static for tests
    bypassGuestPassword: !passwordInputVisible, // If no password input, bypass is enabled
  };
};

/**
 * Gets the current password test configuration from environment (fallback)
 */
export const getPasswordTestConfig = (): PasswordTestConfig => {
  return {
    guestPassword: process.env.VITE_GUEST_PASSWORD || "guest123",
    adminPassword: process.env.VITE_ADMIN_PASSWORD || "admin456",
    bypassGuestPassword: process.env.VITE_GUEST_BYPASS_PASSWORD === "true",
  };
};

/**
 * Handles guest authentication flow with adaptive logic
 * Automatically detects if bypass is enabled and acts accordingly
 */
export const handleGuestAuthentication = async (page: Page): Promise<void> => {
  // Navigate to guest order page
  await page.goto("/order");
  await page.waitForTimeout(2000); // Give page time to load

  // Check if password input is present
  const passwordInput = page.locator('input[type="password"]');
  const passwordInputVisible = await passwordInput.isVisible();

  if (passwordInputVisible) {
    // Password protection is active - handle authentication
    await passwordInput.fill("guest123");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

    // Verify authentication succeeded
    const passwordStillVisible = await passwordInput.isVisible();
    if (passwordStillVisible) {
      throw new Error("Failed to authenticate with guest password");
    }
  } else {
    // Bypass is enabled - no password required
    // Just wait a bit more for the interface to load
    await page.waitForTimeout(1000);
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
 * based on current runtime configuration (adaptive)
 */
export const verifyGuestPasswordProtection = async (
  page: Page,
): Promise<void> => {
  await page.goto("/order");
  await page.waitForTimeout(2000);

  // Detect actual behavior
  const passwordInput = page.locator('input[type="password"]');
  const passwordInputVisible = await passwordInput.isVisible();

  if (passwordInputVisible) {
    // Password protection is active
    // Should not see order interface without authentication
    const orderInterface = page.locator('[data-testid="drink-selection"]');
    const interfaceVisible = await orderInterface.isVisible();

    if (interfaceVisible) {
      throw new Error(
        "Password protection is active but order interface was immediately visible",
      );
    }
  } else {
    // Bypass is enabled
    // Should see order interface or content indicating we're past authentication
    const bodyContent = await page.textContent("body");
    if (bodyContent?.includes("Enter password")) {
      throw new Error(
        "Bypass appears to be enabled but still seeing password prompt",
      );
    }
  }
};

/**
 * Gets test description suffix based on runtime configuration
 * This will be determined dynamically when the test runs
 */
export const getConfigDescription = async (page: Page): Promise<string> => {
  const config = await detectActualConfiguration(page);
  return config.bypassGuestPassword
    ? " (bypass enabled)"
    : " (password required)";
};

/**
 * Gets test description suffix based on environment (fallback)
 */
export const getConfigDescriptionSync = (): string => {
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
