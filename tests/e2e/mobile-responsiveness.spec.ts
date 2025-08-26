import { expect, test } from "@playwright/test";

test.describe("Mobile Responsiveness - User Experience", () => {
  test.describe("Guest Module - Mobile Ordering", () => {
    test("should allow users to browse and order on mobile", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });

      // Navigate to ordering page
      await page.goto("/order");
      await page.waitForLoadState("networkidle");

      // Handle guest authentication
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.isVisible()) {
        await passwordInput.fill("guest123");
        await page.keyboard.press("Enter");
        await page.waitForLoadState("networkidle");
      }

      // Verify drink categories are accessible and functional
      await expect(page.getByRole("tablist")).toBeVisible();

      // Test category switching - key mobile functionality
      await page.getByRole("tab", { name: "Coffee", exact: true }).click();
      await expect(page.getByRole("tabpanel")).toBeVisible();

      // Verify coffee drinks are shown
      await expect(
        page.getByRole("button", { name: /Espresso|Latte|Cappuccino/ }).first(),
      ).toBeVisible();

      // Test Tea category
      await page.getByRole("tab", { name: "Tea" }).click();
      await expect(page.getByRole("tabpanel")).toBeVisible();

      // Test Kids category
      await page.getByRole("tab", { name: "Kids Drinks" }).click();
      await expect(page.getByRole("tabpanel")).toBeVisible();

      // Test All Drinks category
      await page.getByRole("tab", { name: "All Drinks" }).click();
      await expect(page.getByRole("tabpanel")).toBeVisible();

      // Verify drink selection works
      const firstDrink = page.getByRole("button", { name: /Tap to select/ })
        .first();
      await expect(firstDrink).toBeVisible();
      await firstDrink.click();

      // Should navigate to drink customization or next step
      await page.waitForLoadState("networkidle");
    });

    test("should work on very narrow mobile screens", async ({ page }) => {
      // Test on very narrow viewport
      await page.setViewportSize({ width: 320, height: 568 });

      await page.goto("/order");
      await page.waitForLoadState("networkidle");

      // Handle guest authentication
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.isVisible()) {
        await passwordInput.fill("guest123");
        await page.keyboard.press("Enter");
        await page.waitForLoadState("networkidle");
      }

      // Verify all category tabs are still accessible
      await expect(page.getByRole("tablist")).toBeVisible();

      // Test that we can access all categories
      await page.getByRole("tab", { name: "Kids Drinks" }).click();
      await expect(page.getByRole("tabpanel")).toBeVisible();

      // Verify kids drinks are shown
      await expect(
        page.getByRole("button", { name: /Milo|Yakult|Ribena/ }).first(),
      ).toBeVisible();
    });
  });

  test.describe("Admin Module - Mobile Management", () => {
    test.beforeEach(async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });

      // Navigate to admin and login
      await page.goto("/admin");
      await page.waitForLoadState("networkidle");

      // Enter admin password
      const passwordInput = page.getByRole("textbox", { name: "Password" });
      await passwordInput.fill("admin456");
      await page.keyboard.press("Enter");
      await page.waitForLoadState("networkidle");
    });

    test("should display order dashboard properly on mobile", async ({ page }) => {
      // Verify order dashboard loads and is usable
      await expect(
        page.getByRole("heading", { name: /dashboard|order/i }).first(),
      ).toBeVisible();

      // Verify we can see order cards or content
      const content = page.locator("main").first();
      await expect(content).toBeVisible();
    });

    test("should handle menu management on mobile", async ({ page }) => {
      // Navigate to menu management
      await page.getByRole("button", { name: /Menu Management/ }).click();
      await page.waitForLoadState("networkidle");

      // Verify menu tabs are accessible
      await expect(page.getByRole("tablist")).toBeVisible();

      // Test tab switching functionality
      const drinkCategoriesTab = page.getByRole("tab", {
        name: /Drink Categories/i,
      });
      await expect(drinkCategoriesTab).toBeVisible();
      await drinkCategoriesTab.click();

      // Test Drinks tab if it exists
      const drinksTab = page.getByRole("tab", { name: /^Drinks$/i });
      if (await drinksTab.isVisible()) {
        await drinksTab.click();
        await expect(page.getByRole("tabpanel")).toBeVisible();
      }

      // Test Option Categories tab
      const optionCategoriesTab = page.getByRole("tab", {
        name: /Option Categories/i,
      });
      if (await optionCategoriesTab.isVisible()) {
        await optionCategoriesTab.click();
        await expect(page.getByRole("tabpanel")).toBeVisible();
      }
    });
  });

  test.describe("Cross-Device Compatibility", () => {
    const viewports = [
      { width: 375, height: 812, name: "iPhone" },
      { width: 412, height: 915, name: "Android" },
      { width: 768, height: 1024, name: "Tablet" },
    ];

    viewports.forEach(({ width, height, name }) => {
      test(`should work on ${name} (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height });

        // Test guest ordering
        await page.goto("/order");
        await page.waitForLoadState("networkidle");

        // Handle guest authentication
        const passwordInput = page.locator('input[type="password"]');
        if (await passwordInput.isVisible()) {
          await passwordInput.fill("guest123");
          await page.keyboard.press("Enter");
          await page.waitForLoadState("networkidle");
        }

        // Verify basic functionality works
        await expect(page.getByRole("tablist")).toBeVisible();
        await page.getByRole("tab", { name: "Coffee", exact: true }).click();
        await expect(page.getByRole("tabpanel")).toBeVisible();

        // Test admin functionality
        await page.goto("/admin");
        await page.waitForLoadState("networkidle");

        const adminPasswordInput = page.getByRole("textbox", {
          name: "Password",
        });
        await adminPasswordInput.fill("admin456");
        await page.keyboard.press("Enter");
        await page.waitForLoadState("networkidle");

        // Verify admin dashboard works
        await expect(
          page.getByRole("heading", { name: /dashboard|order/i }).first(),
        ).toBeVisible();

        // Test menu management
        await page.getByRole("button", { name: /Menu Management/ }).click();
        await page.waitForLoadState("networkidle");
        await expect(page.getByRole("tablist")).toBeVisible();
      });
    });
  });

  test.describe("Touch and Accessibility", () => {
    test("should handle touch interactions properly", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });

      await page.goto("/order");
      await page.waitForLoadState("networkidle");

      // Handle guest authentication
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.isVisible()) {
        await passwordInput.fill("guest123");
        await page.keyboard.press("Enter");
        await page.waitForLoadState("networkidle");
      }

      // Test touch on category tabs
      const coffeeTab = page.getByRole("tab", { name: "Coffee", exact: true });
      await expect(coffeeTab).toBeVisible();

      // Test that touch interactions work
      await coffeeTab.click();
      await expect(page.getByRole("tabpanel")).toBeVisible();

      // Verify touch targets are adequate size for mobile
      const boundingBox = await coffeeTab.boundingBox();
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(40);
      }
    });

    test("should maintain keyboard accessibility on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });

      await page.goto("/order");
      await page.waitForLoadState("networkidle");

      // Handle guest authentication
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.isVisible()) {
        await passwordInput.fill("guest123");
        await page.keyboard.press("Enter");
        await page.waitForLoadState("networkidle");
      }

      // Test keyboard navigation
      await page.keyboard.press("Tab");
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();

      // Test ARIA roles are maintained
      const tablist = page.getByRole("tablist");
      await expect(tablist).toBeVisible();

      const tabs = page.getByRole("tab");
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThan(0);
    });
  });
});
