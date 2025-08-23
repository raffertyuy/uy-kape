import { expect, test } from "@playwright/test";

/**
 * E2E Tests for Barista Admin Authentication and Dashboard
 *
 * Tests the barista admin password protection and basic dashboard access
 */

// Admin password from environment
const ADMIN_PASSWORD = "admin456";

test.describe("Barista Admin Authentication", () => {
  test("admin can access dashboard with correct password", async ({ page }) => {
    // Navigate to the admin page
    await page.goto("/admin");

    // Should see password prompt
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Enter correct password
    await passwordInput.fill(ADMIN_PASSWORD);
    await page.keyboard.press("Enter");

    // Should be redirected to the admin dashboard
    await page.waitForTimeout(2000);

    // The page should no longer show the password input
    await expect(passwordInput).not.toBeVisible();

    // Should see admin navigation or dashboard elements
    const adminElements = page.locator(
      '[data-testid="admin-nav"], [data-testid="admin-dashboard"], .admin-nav, .admin-dashboard, nav',
    );

    if (await adminElements.count() > 0) {
      await expect(adminElements.first()).toBeVisible();
    } else {
      // Even if specific test IDs aren't found, we should see admin interface
      const bodyContent = await page.textContent("body");
      expect(bodyContent).not.toContain("Enter password");
    }
  });

  test("admin cannot access dashboard with incorrect password", async ({ page }) => {
    // Navigate to the admin page
    await page.goto("/admin");

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

  test("admin dashboard requires password protection", async ({ page }) => {
    // Navigate to the admin page
    await page.goto("/admin");

    // Should immediately see password protection
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Should not see admin interface without authentication
    const adminInterface = page.locator(
      '[data-testid="admin-nav"], .admin-nav',
    );
    expect(await adminInterface.count()).toBe(0);
  });
});
