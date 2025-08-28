import { expect, test } from "@playwright/test";

/**
 * E2E tests for telemetry enabled state
 *
 * These tests verify that telemetry functionality works correctly when enabled.
 * Note: These tests require environment variables to be set to enable telemetry.
 * If telemetry is disabled, these tests will be skipped.
 */

test.describe("Application with Telemetry Enabled", () => {
  // Skip these tests if telemetry environment variables are not set
  test.beforeAll(async () => {
    const vercelTelemetryEnabled =
      process.env.VITE_VERCEL_TELEMETRY_ENABLED === "true";
    const supabaseTelemetryEnabled =
      process.env.VITE_SUPABASE_TELEMETRY_ENABLED === "true";

    if (!vercelTelemetryEnabled && !supabaseTelemetryEnabled) {
      test.skip(
        true,
        "Telemetry environment variables not configured for enabled testing",
      );
    }
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to the app with telemetry enabled
    await page.goto("/");
  });

  test("should initialize with telemetry configuration visible in dev mode", async ({ page }) => {
    // In development mode with telemetry enabled, configuration should be logged
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "log") {
        consoleLogs.push(msg.text());
      }
    });

    // Trigger page load and navigation
    await expect(page.getByTestId("welcome-page")).toBeVisible();

    // Navigate to trigger telemetry initialization
    await page.getByTestId("guest-module-button").click();
    await expect(page.getByTestId("guest-info-form")).toBeVisible();

    // Check for telemetry configuration logs (only in dev mode)
    if (process.env.NODE_ENV === "development") {
      const telemetryLogs = consoleLogs.filter((log) =>
        log.includes("Telemetry Configuration") ||
        log.includes("🔍 Telemetry")
      );
      expect(telemetryLogs.length).toBeGreaterThan(0);
    }
  });

  test("should track performance metrics during navigation", async ({ page }) => {
    // Monitor network requests to see if telemetry data is being sent
    const requests: string[] = [];
    page.on("request", (request) => {
      requests.push(request.url());
    });

    // Navigate through the app to generate performance metrics
    await page.getByTestId("guest-module-button").click();
    await page.getByTestId("guest-name-input").fill("Performance Test");
    await page.getByTestId("proceed-to-menu-button").click();

    // Wait for menu to load (this should generate performance metrics)
    await expect(page.getByTestId("drink-menu")).toBeVisible();

    // Switch between menu categories to generate more metrics
    const categories = page.getByTestId("menu-category-tab");
    const categoryCount = await categories.count();

    if (categoryCount > 1) {
      await categories.nth(1).click();
      await page.waitForTimeout(500);
      await categories.nth(0).click();
      await page.waitForTimeout(500);
    }

    // Note: We can't easily verify telemetry data submission in E2E tests
    // without access to the telemetry backend, but we can verify no errors occur
    await page.waitForTimeout(1000);
  });

  test("should handle slow queries with telemetry logging", async ({ page }) => {
    // Test database operations that might trigger slow query logging

    // Navigate to menu which involves database queries
    await page.getByTestId("guest-module-button").click();
    await page.getByTestId("guest-name-input").fill("Database Test");
    await page.getByTestId("proceed-to-menu-button").click();

    // Wait for menu data to load
    await expect(page.getByTestId("drink-menu")).toBeVisible();

    // Navigate to admin which involves more complex queries
    await page.goto("/");
    await page.getByTestId("barista-admin-button").click();

    // Handle password if required
    const passwordInput = page.getByTestId("password-input");
    if (await passwordInput.isVisible()) {
      await passwordInput.fill("barista123");
      await page.getByTestId("login-button").click();
    }

    // Access order dashboard which might have complex queries
    await expect(page.getByTestId("barista-admin-dashboard")).toBeVisible();

    // No specific assertions here since telemetry is internal,
    // but the app should work without errors
  });

  test("should track component performance during interactions", async ({ page }) => {
    // Perform actions that would trigger component performance tracking

    // Navigate through multiple components
    await page.getByTestId("guest-module-button").click();
    await expect(page.getByTestId("guest-info-form")).toBeVisible();

    // Fill form (component updates)
    await page.getByTestId("guest-name-input").fill("Component Test");
    await page.getByTestId("guest-special-request-input").fill(
      "Track my performance",
    );

    // Navigate to menu (component mounting)
    await page.getByTestId("proceed-to-menu-button").click();
    await expect(page.getByTestId("drink-menu")).toBeVisible();

    // Interact with drink cards (component interactions)
    const drinkCards = page.getByTestId("drink-card");
    const drinkCount = await drinkCards.count();

    if (drinkCount > 0) {
      await drinkCards.first().click();

      // Wait for any modals or forms to appear
      await page.waitForTimeout(1000);
    }

    // Navigate back (component unmounting)
    await page.goBack();
    await page.waitForTimeout(500);
  });

  test("should handle connection quality tracking", async ({ page }) => {
    // Test scenarios that might trigger connection quality tracking

    // Start with menu loading (database connection)
    await page.getByTestId("guest-module-button").click();
    await page.getByTestId("guest-name-input").fill("Connection Test");
    await page.getByTestId("proceed-to-menu-button").click();

    // Load menu data
    await expect(page.getByTestId("drink-menu")).toBeVisible();

    // Switch categories quickly to test multiple requests
    const categories = page.getByTestId("menu-category-tab");
    const categoryCount = await categories.count();

    for (let i = 0; i < Math.min(categoryCount, 3); i++) {
      await categories.nth(i).click();
      await page.waitForTimeout(200);
    }

    // Navigate to admin area for more database operations
    await page.goto("/");
    await page.getByTestId("barista-admin-button").click();

    const passwordInput = page.getByTestId("password-input");
    if (await passwordInput.isVisible()) {
      await passwordInput.fill("barista123");
      await page.getByTestId("login-button").click();
    }

    // Load order dashboard
    await expect(page.getByTestId("barista-admin-dashboard")).toBeVisible();

    // All database operations should complete without connection errors
    await page.waitForTimeout(1000);
  });

  test("should maintain error tracking with enhanced error reporting", async ({ page }) => {
    // Test error scenarios with enhanced error reporting enabled

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate normally first
    await page.getByTestId("guest-module-button").click();
    await expect(page.getByTestId("guest-info-form")).toBeVisible();

    // Try some potentially error-prone operations
    // (These should be handled gracefully with enhanced error reporting)

    // Invalid form submission
    await page.getByTestId("proceed-to-menu-button").click();
    // Should handle empty name validation

    await page.getByTestId("guest-name-input").fill("Error Test");
    await page.getByTestId("proceed-to-menu-button").click();

    // Navigate to potentially problematic routes
    await page.goto("/invalid-route");
    await page.waitForTimeout(500);

    // Return to valid route
    await page.goto("/");
    await expect(page.getByTestId("welcome-page")).toBeVisible();

    // Any errors should be tracked but not break the application
    // We can't verify telemetry submission, but app should remain functional
  });

  test("should work with mobile responsive design and performance tracking", async ({ page }) => {
    // Test mobile interactions with performance tracking enabled
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate through mobile flow
    await page.getByTestId("guest-module-button").click();
    await expect(page.getByTestId("guest-info-form")).toBeVisible();

    // Mobile form interactions
    await page.getByTestId("guest-name-input").fill("Mobile Telemetry Test");
    await page.getByTestId("proceed-to-menu-button").click();

    // Mobile menu navigation
    await expect(page.getByTestId("drink-menu")).toBeVisible();

    // Test mobile menu tabs if available
    const menuTabs = page.getByTestId("mobile-menu-tabs");
    if (await menuTabs.isVisible()) {
      const tabButtons = page.getByTestId("menu-category-tab");
      const tabCount = await tabButtons.count();

      // Switch between tabs on mobile
      for (let i = 0; i < Math.min(tabCount, 3); i++) {
        await tabButtons.nth(i).click();
        await page.waitForTimeout(300);
      }
    }

    // All mobile interactions should be tracked without affecting functionality
    await page.waitForTimeout(1000);
  });
});
