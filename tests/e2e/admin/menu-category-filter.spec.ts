import { expect, test } from "@playwright/test";

test.describe("Menu Management - Category Filter", () => {
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

    // Click on Drinks tab
    await page.getByRole("tab", { name: /Drinks/ }).click();

    // Wait for drinks to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000); // Give a moment for the data to load
  });

  test("should access drinks management page and show category filter", async ({ page }) => {
    // Verify we can see the category filter dropdown
    const filterDropdown = page.getByRole("combobox", {
      name: "Filter by Category",
    });
    await expect(filterDropdown).toBeVisible();

    // Check that "All Categories" is the default option
    await expect(filterDropdown).toHaveValue("");

    // Verify search input is present
    const searchInput = page.locator("#search");
    await expect(searchInput).toBeVisible();

    // Verify view mode toggle buttons are present
    await expect(page.getByRole("button", { name: "Grid view" })).toBeVisible();
    await expect(page.getByRole("button", { name: "List view" })).toBeVisible();

    // Verify at least some drinks are displayed
    await expect(page.getByRole("heading", { name: "Espresso", exact: true }))
      .toBeVisible();
  });

  test("should filter drinks using search functionality", async ({ page }) => {
    // Wait for drinks to load
    await expect(page.getByRole("heading", { name: "Espresso", exact: true }))
      .toBeVisible();
    await expect(page.getByRole("heading", { name: "Milo" })).toBeVisible();

    // Use search to filter drinks
    const searchInput = page.locator("#search");
    await searchInput.fill("espresso");

    // Wait for search filtering to take effect
    await page.waitForTimeout(500);

    // Should show Espresso-related drinks (check for first specific drink)
    await expect(page.getByRole("heading", { name: "Espresso", exact: true }))
      .toBeVisible();

    // Should not show unrelated drinks
    await expect(page.getByRole("heading", { name: "Milo" })).not.toBeVisible();

    // Should show search filter indicator
    await expect(page.getByText('Search: "espresso"')).toBeVisible();

    // Clear search using the clear button
    await page.getByRole("button", { name: "Clear search" }).click();
    await page.waitForTimeout(500);

    // Should show all drinks again
    await expect(page.getByRole("heading", { name: "Espresso", exact: true }))
      .toBeVisible();
    await expect(page.getByRole("heading", { name: "Milo" })).toBeVisible();
  });

  test("should toggle between grid and list view modes", async ({ page }) => {
    // Wait for page to load
    const filterDropdown = page.getByRole("combobox", {
      name: "Filter by Category",
    });
    await expect(filterDropdown).toBeVisible();

    // Initially should be in grid view (check button states)
    const gridButton = page.getByRole("button", { name: "Grid view" });
    const listButton = page.getByRole("button", { name: "List view" });

    // Verify both buttons exist
    await expect(gridButton).toBeVisible();
    await expect(listButton).toBeVisible();

    // Click list view
    await listButton.click();
    await page.waitForTimeout(300);

    // Click back to grid view
    await gridButton.click();
    await page.waitForTimeout(300);

    // Verify we can still see drinks after view changes
    await expect(page.getByRole("heading", { name: "Espresso", exact: true }))
      .toBeVisible();
  });
});
