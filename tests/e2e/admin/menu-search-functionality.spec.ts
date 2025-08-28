import { expect, test } from "@playwright/test";

test.describe("Menu Search Functionality E2E Tests", () => {
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

  test.describe("Drink Categories Tab Search", () => {
    test("should filter drink categories by search query", async ({ page }) => {
      // Ensure we're on the drink categories tab (it should be selected by default)
      await expect(page.getByRole("tab", { name: /Drink Categories/ }))
        .toHaveAttribute("aria-selected", "true");

      // Wait for content to load
      await page.waitForSelector('h3:has-text("Coffee")', { timeout: 10000 });

      // Count initial categories (look for category headings)
      const initialCount = await page.locator("h3").count();
      expect(initialCount).toBeGreaterThan(0);

      // Search for a specific term
      const searchInput = page.locator(
        'input[placeholder*="Search drink categories"]',
      );
      await searchInput.fill("Coffee");

      // Wait for search results to update
      await page.waitForTimeout(500);

      // Verify filtered results
      const filteredCount = await page.locator("h3").count();
      expect(filteredCount).toBeGreaterThan(0);
      expect(filteredCount).toBeLessThanOrEqual(initialCount);

      // Verify search query in URL
      await expect(page).toHaveURL(/.*search=Coffee/);

      // Clear search and verify all categories return
      await searchInput.clear();
      await page.waitForTimeout(500);

      const clearedCount = await page.locator("h3").count();
      expect(clearedCount).toBe(initialCount);
    });

    test("should show no results message for non-existent search", async ({ page }) => {
      await expect(page.getByRole("tab", { name: /Drink Categories/ }))
        .toHaveAttribute("aria-selected", "true");
      await page.waitForSelector('h3:has-text("Coffee")', { timeout: 10000 });

      const searchInput = page.locator(
        'input[placeholder*="Search drink categories"]',
      );
      await searchInput.fill("NonExistentCategory12345");
      await page.waitForTimeout(500);

      // Should show no category results
      await expect(
        page.locator(
          'h3:has-text("Coffee"), h3:has-text("Tea"), h3:has-text("Specialty"), h3:has-text("Special Coffee")',
        ),
      ).toHaveCount(0);

      // Look for no results message (text may vary)
      const noResultsElement = page.locator(
        "text=/No.*categories.*found|No.*categories.*match|No.*found/i",
      );
      await expect(noResultsElement).toBeVisible();
    });
  });

  test.describe("Drinks Tab Search", () => {
    test("should filter drinks by search query", async ({ page }) => {
      await page.getByRole("tab", { name: /Drinks/ }).click();
      await page.waitForTimeout(1000); // Wait for tab content to load

      // Wait for drinks to load (looking for drink names/headings)
      await page.waitForSelector("h3", { timeout: 10000 });

      const initialCount = await page.locator("h3").count();
      expect(initialCount).toBeGreaterThan(0);

      // Search for drinks
      const searchInput = page.locator("#search");
      await searchInput.fill("Coffee");
      await page.waitForTimeout(500);

      const filteredCount = await page.locator("h3").count();
      expect(filteredCount).toBeGreaterThan(0);
      expect(filteredCount).toBeLessThanOrEqual(initialCount);

      // Verify URL persistence
      await expect(page).toHaveURL(/.*search=Coffee/);
    });

    test("should maintain search when switching between tabs", async ({ page }) => {
      // Start with drink categories (should be selected by default)
      await expect(page.getByRole("tab", { name: /Drink Categories/ }))
        .toHaveAttribute("aria-selected", "true");
      await page.waitForSelector('h3:has-text("Coffee")', { timeout: 10000 });

      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill("Tea");
      await page.waitForTimeout(500);

      // Switch to drinks tab
      await page.getByRole("tab", { name: /Drinks/ }).click();
      await page.waitForTimeout(500);

      // Verify search query persists
      await expect(searchInput).toHaveValue("Tea");
      await expect(page).toHaveURL(/.*search=Tea/);

      // Switch to options tab
      await page.getByRole("tab", { name: /Option Categories/ }).click();
      await page.waitForTimeout(500);

      // Verify search still persists
      await expect(searchInput).toHaveValue("Tea");
      await expect(page).toHaveURL(/.*search=Tea/);
    });
  });

  test.describe("Option Categories Tab Search", () => {
    test("should filter option categories by search query", async ({ page }) => {
      await page.getByRole("tab", { name: /Option Categories/ }).click();
      await page.waitForTimeout(1000); // Wait for tab content to load

      // Wait for option categories to load
      await page.waitForSelector("h3", { timeout: 10000 });

      const initialCount = await page.locator("h3").count();
      expect(initialCount).toBeGreaterThan(0);

      // Search for option categories
      const searchInput = page.locator(
        'input[placeholder*="Search option categories"]',
      );
      await searchInput.fill("Size");
      await page.waitForTimeout(500);

      const filteredCount = await page.locator("h3").count();
      expect(filteredCount).toBeGreaterThan(0);
      expect(filteredCount).toBeLessThanOrEqual(initialCount);

      await expect(page).toHaveURL(/.*search=Size/);
    });
  });

  test.describe("Search and Filter Integration", () => {
    test("should work with filters on drinks tab", async ({ page }) => {
      await page.getByRole("tab", { name: /Drinks/ }).click();
      await page.waitForTimeout(1000); // Wait for tab content to load

      // Wait for drinks to load
      await page.waitForSelector("h3", { timeout: 10000 });

      // Apply search first
      const searchInput = page.locator('input[placeholder*="Search drinks"]');
      await searchInput.fill("Coffee");
      await page.waitForTimeout(500);

      const searchResultsCount = await page.locator("h3").count();

      // Apply category filter if available (check if filters button exists)
      const filtersButton = page.getByRole("button", { name: /Filters/ });
      if (await filtersButton.isVisible()) {
        await filtersButton.click();
        await page.waitForTimeout(500);

        const combinedResultsCount = await page.locator("h3").count();
        expect(combinedResultsCount).toBeLessThanOrEqual(searchResultsCount);
      }
    });

    test("should clear search properly", async ({ page }) => {
      await page.getByRole("tab", { name: /Drinks/ }).click();
      await page.waitForSelector("h3", {
        timeout: 10000,
      });

      // Count initial drink cards instead of h3 elements
      const initialDrinkCount = await page.locator('[data-testid="drink-card"]')
        .count();

      // Apply search
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill("Test Search");
      await page.waitForTimeout(500);

      // Clear search using clear button if available
      const clearButton = page.locator(
        'button[aria-label*="Clear"], button:has-text("Clear"), button:has-text("×")',
      );
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForTimeout(500);

        // Verify search is cleared
        await expect(searchInput).toHaveValue("");

        // Verify URL is updated
        await expect(page).not.toHaveURL(/.*search=/);
      } else {
        // Clear manually if no clear button
        await searchInput.clear();
        await page.waitForTimeout(500);
      }

      // Verify drink count returns to initial (or close to it, allowing for pagination)
      const finalDrinkCount = await page.locator('[data-testid="drink-card"]')
        .count();
      expect(finalDrinkCount).toBeGreaterThanOrEqual(
        Math.min(initialDrinkCount, 10),
      ); // Account for pagination
    });
  });

  test.describe("Mobile Responsiveness", () => {
    test("should work on mobile viewport", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.getByRole("tab", { name: /Drinks/ }).click();
      await page.waitForTimeout(1000); // Wait for tab content to load

      // Wait for drinks to load
      await page.waitForSelector("h3", { timeout: 10000 });

      // Search for drinks
      const searchInput = page.locator("#search");
      await searchInput.fill("Coffee");

      await searchInput.fill("Coffee");
      await page.waitForTimeout(500);

      // Verify results show on mobile (check for drink headings)
      const drinkHeadings = page.locator("h3");
      await expect(drinkHeadings.first()).toBeVisible();

      // Verify URL persistence on mobile
      await expect(page).toHaveURL(/.*search=Coffee/);
    });
  });

  test.describe("Accessibility", () => {
    test("should be keyboard accessible", async ({ page }) => {
      await page.getByRole("tab", { name: /Drinks/ }).click();
      await page.waitForTimeout(1000); // Wait for tab content to load

      // Wait for drinks to load
      await page.waitForSelector("h3", { timeout: 10000 });

      // Tab to search input
      const searchInput = page.locator("#search");
      await searchInput.focus();
      await expect(searchInput).toBeFocused();

      // Type search query
      await page.keyboard.type("Coffee");
      await page.waitForTimeout(500);

      // Verify results update
      const drinkHeadings = page.locator("h3");
      await expect(drinkHeadings.first()).toBeVisible();

      // Test escape to clear (if implemented)
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    });
  });
});
