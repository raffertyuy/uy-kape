import { expect, test } from "@playwright/test";

/**
 * E2E Tests for Core Application Functionality
 *
 * Tests essential features that work without database dependencies
 */

const GUEST_PASSWORD = "guest123";
const ADMIN_PASSWORD = "admin456";

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

  test("guest password protection works", async ({ page }) => {
    await page.goto("/order");

    // Should require password
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Wrong password should not work
    await passwordInput.fill("wrong");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);

    // Should still be on password screen
    const stillProtected = await passwordInput.isVisible();
    expect(stillProtected).toBe(true);

    // Correct password should work
    await passwordInput.fill(GUEST_PASSWORD);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

    // Should be past password protection
    const passwordGone = !(await passwordInput.isVisible());
    expect(passwordGone).toBe(true);
  });

  test("admin password protection works", async ({ page }) => {
    await page.goto("/admin");

    // Should require password
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Wrong password should not work
    await passwordInput.fill("wrong");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);

    // Should still be on password screen
    const stillProtected = await passwordInput.isVisible();
    expect(stillProtected).toBe(true);

    // Correct password should work
    await passwordInput.fill(ADMIN_PASSWORD);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

    // Should be past password protection
    const passwordGone = !(await passwordInput.isVisible());
    expect(passwordGone).toBe(true);
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
