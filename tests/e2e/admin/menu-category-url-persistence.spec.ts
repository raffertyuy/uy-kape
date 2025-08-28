import { expect, test } from "@playwright/test";

test.describe("Menu Management - Category Name URL Persistence", () => {
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

  test("should persist category filter in URL using category name", async ({ page }) => {
    // Navigate to drinks tab
    await page.getByRole("tab", { name: /drinks/i }).click();
    await page.waitForLoadState("networkidle");

    // Select Coffee category from the filter dropdown
    await page.getByLabel("Filter by Category").selectOption("Coffee");
    await page.waitForTimeout(500);

    // Check that URL contains category name parameter
    const url = page.url();
    expect(url).toContain("category=Coffee");
    expect(url).toContain("tab=drinks");
  });

  test("should handle category names with spaces in URL", async ({ page }) => {
    // Navigate to drinks tab
    await page.getByRole("tab", { name: /drinks/i }).click();
    await page.waitForLoadState("networkidle");

    // Select Special Coffee category (contains space)
    await page.getByLabel("Filter by Category").selectOption("Special Coffee");
    await page.waitForTimeout(500);

    // Check that URL contains URL-encoded category name (either %20 or + for spaces)
    const url = page.url();
    expect(url).toMatch(/category=Special(?:%20|\+)Coffee/);
  });

  test("should restore category filter from URL on page load", async ({ page }) => {
    // Navigate directly to drinks tab with category filter in URL
    await page.goto("/admin?view=menu&tab=drinks&category=Coffee");

    // Wait for page to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Check that the category filter dropdown shows the correct selection
    const categoryFilter = page.getByLabel("Filter by Category");
    await expect(categoryFilter).toHaveValue("Coffee");

    // Check that filtered drinks are displayed
    await expect(page.getByText("Active filters:")).toBeVisible();
    // Target the active filters section specifically
    await expect(
      page.locator('text="Active filters:"').locator("..").getByText(
        "Category: Coffee",
      ),
    ).toBeVisible();
  });

  test("should restore URL-encoded category name from URL", async ({ page }) => {
    // Navigate directly with URL-encoded category name
    await page.goto("/admin?view=menu&tab=drinks&category=Special%20Coffee");

    // Wait for page to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Check that the category filter dropdown shows the correct selection
    const categoryFilter = page.getByLabel("Filter by Category");
    await expect(categoryFilter).toHaveValue("Special Coffee");

    // Check that active filter shows the decoded name
    await expect(
      page.locator('text="Active filters:"').locator("..").getByText(
        "Category: Special Coffee",
      ),
    ).toBeVisible();
  });

  test("should clear category parameter when filter is cleared", async ({ page }) => {
    // Start with category filter applied
    await page.goto("/admin?view=menu&tab=drinks&category=Coffee");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Clear the category filter
    await page.getByLabel("Filter by Category").selectOption("");
    await page.waitForTimeout(500);

    // Check that category parameter is removed from URL
    const url = page.url();
    expect(url).not.toContain("category=");
    expect(url).toContain("tab=drinks"); // Should still have tab parameter
  });

  test("should clear category parameter when using clear button", async ({ page }) => {
    // Start with category filter applied
    await page.goto("/admin?view=menu&tab=drinks&category=Coffee");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Click the clear button next to the category dropdown
    await page.getByLabel("Clear category filter").click();
    await page.waitForTimeout(500);

    // Check that category parameter is removed from URL
    const url = page.url();
    expect(url).not.toContain("category=");
    expect(url).toContain("tab=drinks");

    // Check that dropdown resets to "All Categories"
    const categoryFilter = page.getByLabel("Filter by Category");
    await expect(categoryFilter).toHaveValue("");
  });

  test("should clear category parameter when switching away from drinks tab", async ({ page }) => {
    // Start with category filter applied on drinks tab
    await page.goto("/admin?view=menu&tab=drinks&category=Coffee");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Switch to categories tab
    await page.getByRole("tab", { name: /drink categories/i }).click();
    await page.waitForTimeout(500);

    // Check that category parameter is removed from URL
    const url = page.url();
    expect(url).not.toContain("category=");
    expect(url).not.toContain("tab="); // Categories is default tab
  });

  test("should maintain category filter when switching back to drinks tab", async ({ page }) => {
    // Start on drinks tab with category filter
    await page.goto("/admin?view=menu&tab=drinks&category=Coffee");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Switch to categories tab (this should clear the filter)
    await page.getByRole("tab", { name: /drink categories/i }).click();
    await page.waitForTimeout(500);

    // Switch back to drinks tab
    await page.getByRole("tab", { name: /drinks/i }).click();
    await page.waitForTimeout(500);

    // Category filter should be cleared (not persisted across tab switches)
    const url = page.url();
    expect(url).not.toContain("category=");

    const categoryFilter = page.getByLabel("Filter by Category");
    await expect(categoryFilter).toHaveValue("");
  });

  test("should combine category filter with other parameters", async ({ page }) => {
    // Navigate to drinks tab
    await page.getByRole("tab", { name: /drinks/i }).click();
    await page.waitForLoadState("networkidle");

    // Apply category filter
    await page.getByLabel("Filter by Category").selectOption("Coffee");
    await page.waitForTimeout(500);

    // Add search query (if search functionality exists)
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Latte");
      await page.waitForTimeout(500);
    }

    // Check that URL contains both parameters
    const url = page.url();
    expect(url).toContain("category=Coffee");
    expect(url).toContain("tab=drinks");
    if (await searchInput.isVisible()) {
      expect(url).toContain("search=Latte");
    }
  });

  test("should handle invalid category names gracefully", async ({ page }) => {
    // Navigate directly with non-existent category
    await page.goto("/admin?view=menu&tab=drinks&category=NonExistentCategory");

    // Wait for page to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Page should still load without errors
    await expect(page.getByRole("tab", { name: /drinks/i })).toBeVisible();

    // Category filter should show "All Categories" as fallback
    const categoryFilter = page.getByLabel("Filter by Category");
    await expect(categoryFilter).toHaveValue("");

    // Should show "No drinks found" if the category doesn't exist
    const content = await page.textContent("body");
    expect(content).toContain("No drinks found");
  });

  test("should update active filters display with category name", async ({ page }) => {
    // Navigate to drinks tab with category filter
    await page.goto("/admin?view=menu&tab=drinks&category=Coffee");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Check that active filters section shows the category name
    await expect(page.getByText("Active filters:")).toBeVisible();
    await expect(
      page.locator('text="Active filters:"').locator("..").getByText(
        "Category: Coffee",
      ),
    ).toBeVisible();

    // Remove filter button should be present
    await expect(page.getByLabel("Remove category filter")).toBeVisible();
  });

  test("should clear filter using active filter remove button", async ({ page }) => {
    // Navigate to drinks tab with category filter
    await page.goto("/admin?view=menu&tab=drinks&category=Coffee");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Click the remove button in active filters
    await page.getByLabel("Remove category filter").click();
    await page.waitForTimeout(500);

    // Check that URL is updated
    const url = page.url();
    expect(url).not.toContain("category=");

    // Check that active filters section is hidden
    await expect(page.getByText("Active filters:")).not.toBeVisible();
  });

  test("should preserve category filter during page refresh", async ({ page }) => {
    // Navigate to drinks tab with category filter
    await page.goto("/admin?view=menu&tab=drinks&category=Tea");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Refresh the page
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Check that filter is still applied
    const categoryFilter = page.getByLabel("Filter by Category");
    await expect(categoryFilter).toHaveValue("Tea");

    await expect(
      page.locator('text="Active filters:"').locator("..").getByText(
        "Category: Tea",
      ),
    ).toBeVisible();

    // URL should still contain the parameter
    const url = page.url();
    expect(url).toContain("category=Tea");
  });
});
