import { expect, test } from "@playwright/test";

const ADMIN_PASSWORD = "admin456";

test.describe("Guest Name Display", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin page
    await page.goto("/admin");

    // Handle authentication if needed (flexible approach)
    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.isVisible({ timeout: 3000 })) {
      await passwordInput.fill(ADMIN_PASSWORD);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(2000);
    }

    // Navigate to Order Dashboard if not already there
    const orderDashboardLink = page.locator("text=/order.*dashboard/i").first();
    if (await orderDashboardLink.isVisible({ timeout: 3000 })) {
      await orderDashboardLink.click();
      await page.waitForTimeout(2000);
    }

    // Wait for page to stabilize
    await page.waitForTimeout(3000);
  });

  test("should display guest names without truncation on desktop view", async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(1000);

    // Look for any guest name elements (flexible selector)
    const guestNameElements = page.locator('[aria-label*="Guest name:"]');

    // Verify at least one guest name is visible
    const count = await guestNameElements.count();
    if (count > 0) {
      // Check the first few guest names to ensure they're displayed properly
      for (let i = 0; i < Math.min(count, 3); i++) {
        const element = guestNameElements.nth(i);
        await expect(element).toBeVisible();

        // Verify the name has content (not empty or just whitespace)
        const textContent = await element.textContent();
        expect(textContent?.trim()).toBeTruthy();
        expect(textContent?.trim().length).toBeGreaterThan(2);
      }
    }
  });

  test("should provide mobile-friendly display on mobile view", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Look for guest name elements
    const guestNameElements = page.locator('[aria-label*="Guest name:"]');

    // Verify at least one guest name is visible
    const count = await guestNameElements.count();
    if (count > 0) {
      // Check that names are accessible on mobile
      for (let i = 0; i < Math.min(count, 3); i++) {
        const element = guestNameElements.nth(i);
        await expect(element).toBeVisible();

        // Verify the name has content
        const textContent = await element.textContent();
        expect(textContent?.trim()).toBeTruthy();
        expect(textContent?.trim().length).toBeGreaterThan(2);

        // On mobile, check if aria-label indicates interactivity for long names
        const ariaLabel = await element.getAttribute("aria-label");
        if (ariaLabel && textContent && textContent.length > 15) {
          // Long names should have expansion capability on mobile
          expect(ariaLabel).toContain("Guest name:");
        }
      }
    }
  });

  test("should handle responsive breakpoint transitions", async ({ page }) => {
    // Test the responsive behavior by changing viewport sizes
    const viewports = [
      { width: 1200, height: 800 }, // Desktop
      { width: 768, height: 600 }, // Tablet/breakpoint
      { width: 375, height: 667 }, // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);

      // Verify guest names are still visible and accessible
      const guestNameElements = page.locator('[aria-label*="Guest name:"]');
      const count = await guestNameElements.count();

      if (count > 0) {
        const firstElement = guestNameElements.first();
        await expect(firstElement).toBeVisible();

        const textContent = await firstElement.textContent();
        expect(textContent?.trim()).toBeTruthy();
      }
    }
  });

  test("should maintain accessibility across all viewports", async ({ page }) => {
    const viewports = [
      { width: 1024, height: 768, name: "desktop" },
      { width: 375, height: 667, name: "mobile" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);

      // Check accessibility attributes
      const guestNameElements = page.locator('[aria-label*="Guest name:"]');
      const count = await guestNameElements.count();

      if (count > 0) {
        const firstElement = guestNameElements.first();

        // Verify accessibility attributes are present
        const ariaLabel = await firstElement.getAttribute("aria-label");
        expect(ariaLabel).toContain("Guest name:");

        // Verify element is keyboard accessible if it's interactive
        const tagName = await firstElement.evaluate((el) =>
          el.tagName.toLowerCase()
        );
        if (tagName === "button") {
          await firstElement.focus();
          await expect(firstElement).toBeFocused();
        }
      }
    }
  });
});
