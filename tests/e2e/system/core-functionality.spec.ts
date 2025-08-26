import { expect, test } from "@playwright/test";
import {
  getConfigDescription,
  handleAdminAuthentication,
  verifyGuestPasswordProtection,
} from "../../config/password-test-utils";

/**
 * E2E Tests for Core Application Functionality
 *
 * Tests essential features that work without database dependencies
 * Dynamically adapts to password bypass configuration
 */

test.describe("Core Application Functionality", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");

    // Should see the homepage content
    await expect(page).toHaveTitle(/Kape/);

    // Should have navigation to key sections
    const orderLink = page.locator("text=/order|guest/i");
    const adminLink = page.locator("text=/admin|barista/i");

    // At least one of these navigation elements should be present
    const hasNavigation = (await orderLink.count()) > 0 ||
      (await adminLink.count()) > 0;
    expect(hasNavigation).toBe(true);
  });

  test(`guest password protection works${getConfigDescription()}`, async ({ page }) => {
    // Use the dynamic verification that adapts to bypass configuration
    await verifyGuestPasswordProtection(page);
  });

  test("admin password protection works", async ({ page }) => {
    // Admin authentication flow (always requires password - no bypass)
    await handleAdminAuthentication(page);
  });

  test("application has proper error boundaries", async ({ page }) => {
    // Navigate to a potentially non-existent route
    await page.goto("/nonexistent");

    // Should not crash - either redirect or show 404
    const bodyText = await page.textContent("body");
    expect(bodyText).toBeTruthy();

    // Should still have basic page structure
    const hasContent = bodyText && bodyText.length > 10;
    expect(hasContent).toBe(true);
  });

  test("responsive design basics work", async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto("/");

    const desktopContent = await page.textContent("body");
    expect(desktopContent).toBeTruthy();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    const mobileContent = await page.textContent("body");
    expect(mobileContent).toBeTruthy();

    // Content should be similar between views
    expect(mobileContent).toContain("Kape");
  });
});
