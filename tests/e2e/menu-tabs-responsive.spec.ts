import { expect, test } from "@playwright/test";

test.describe("MenuTabs Mobile Responsiveness", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the admin page
    await page.goto("/admin");

    // Enter admin password
    const passwordInput = page.getByRole("textbox", { name: "Password" });
    await passwordInput.fill("admin456");
    await page.keyboard.press("Enter");

    // Wait for dashboard to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Click Menu Management button
    await page.getByRole("button", { name: /Menu Management/ }).click();

    // Wait for menu management to load
    await page.waitForLoadState("networkidle");
  });

  test("should display all tabs on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that all three tabs are visible
    await expect(page.getByRole("tab", { name: /drink categories/i }))
      .toBeVisible();
    await expect(page.getByRole("tab", { name: /drinks/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /option categories/i }))
      .toBeVisible();
  });

  test("should allow horizontal scrolling on mobile when tabs overflow", async ({ page }) => {
    // Set small mobile viewport to force overflow
    await page.setViewportSize({ width: 320, height: 568 });

    // Check that tablist has horizontal scroll
    const tablist = page.getByRole("tablist");
    await expect(tablist).toHaveCSS("overflow-x", "auto");

    // Check that tabs maintain their size
    const tabs = page.getByRole("tab");
    const firstTab = tabs.first();
    await expect(firstTab).toHaveClass(/flex-shrink-0/);
  });

  test("should navigate between tabs on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Click on Drinks tab
    await page.getByRole("tab", { name: /drinks/i }).click();

    // Check that content changed
    await expect(page.getByRole("tabpanel", { name: /drinks/i })).toBeVisible();

    // Click on Option Categories tab
    await page.getByRole("tab", { name: /option categories/i }).click();

    // Check that content changed
    await expect(page.getByRole("tabpanel", { name: /option categories/i }))
      .toBeVisible();
  });

  test("should support keyboard navigation on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Focus on first tab
    await page.getByRole("tab", { name: /drink categories/i }).focus();

    // Use arrow key to navigate
    await page.keyboard.press("ArrowRight");

    // Should navigate to drinks tab
    await expect(page.getByRole("tabpanel", { name: /drinks/i })).toBeVisible();

    // Use Home key to go back to first tab
    await page.keyboard.press("Home");

    // Should navigate back to categories
    await expect(page.getByRole("tabpanel", { name: /drink categories/i }))
      .toBeVisible();
  });

  test("should work correctly on tablet viewport", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // All tabs should be visible with more spacing
    const tablist = page.getByRole("tablist");
    await expect(tablist).toHaveClass(/sm:space-x-8/);

    // Tabs should still be functional
    await page.getByRole("tab", { name: /drinks/i }).click();
    await expect(page.getByRole("tabpanel", { name: /drinks/i })).toBeVisible();
  });

  test("should work correctly on desktop viewport", async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // All tabs should be visible with desktop spacing
    const tablist = page.getByRole("tablist");
    await expect(tablist).toHaveClass(/sm:space-x-8/);

    // Navigation should still work
    await page.getByRole("tab", { name: /option categories/i }).click();
    await expect(page.getByRole("tabpanel", { name: /option categories/i }))
      .toBeVisible();
  });

  test("should handle tab overflow gracefully on very narrow screens", async ({ page }) => {
    // Set very narrow viewport
    await page.setViewportSize({ width: 280, height: 568 });

    // Tabs should still be accessible via horizontal scroll
    const tablist = page.getByRole("tablist");
    await expect(tablist).toHaveCSS("overflow-x", "auto");

    // Should be able to click on the last tab even if initially not visible
    await page.getByRole("tab", { name: /option categories/i }).click();
    await expect(page.getByRole("tabpanel", { name: /option categories/i }))
      .toBeVisible();
  });

  test("should maintain accessibility attributes across viewports", async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 }, // Small mobile
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1280, height: 720 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // Check ARIA attributes
      const tablist = page.getByRole("tablist");
      await expect(tablist).toHaveAttribute(
        "aria-label",
        "Menu management tabs",
      );

      // Check that active tab has correct attributes
      const activeTab = page.getByRole("tab", { selected: true });
      await expect(activeTab).toHaveAttribute("aria-selected", "true");
      await expect(activeTab).toHaveAttribute("tabindex", "0");

      // Check that inactive tabs have correct attributes
      const inactiveTabs = page.getByRole("tab", { selected: false });
      const count = await inactiveTabs.count();
      for (let i = 0; i < count; i++) {
        await expect(inactiveTabs.nth(i)).toHaveAttribute(
          "aria-selected",
          "false",
        );
        await expect(inactiveTabs.nth(i)).toHaveAttribute("tabindex", "-1");
      }
    }
  });

  test("should display count badges correctly on all viewports", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1280, height: 720 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // Check that count badges are visible in tabs
      await expect(page.getByRole("tab", { name: /Drink Categories.*4/ }))
        .toBeVisible();
      await expect(page.getByRole("tab", { name: /Drinks.*17/ })).toBeVisible();
      await expect(page.getByRole("tab", { name: /Option Categories.*5/ }))
        .toBeVisible();
    }
  });

  test("should handle focus management correctly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Focus on the active tab explicitly
    const activeTab = page.getByRole("tab", { selected: true });
    await activeTab.focus();

    // Should focus on active tab
    await expect(activeTab).toBeFocused();

    // Arrow navigation should work - manually click to verify tabs work
    const optionCategoriesTab = page.getByRole("tab", {
      name: /Option Categories/,
    });
    await optionCategoriesTab.click();

    // Should be on Option Categories tab
    await expect(page.getByRole("tabpanel", { name: /Option Categories 5/ }))
      .toBeVisible();
  });
});
