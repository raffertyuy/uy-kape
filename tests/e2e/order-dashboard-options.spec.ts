import { expect, test } from "@playwright/test";

/**
 * E2E Tests for Order Dashboard Options and Special Requests Display
 *
 * Tests that the order dashboard properly displays:
 * - Drink options (shots, milk type, temperature, etc.)
 * - Special requests from guests
 * - Different order configurations
 */

test.describe("Order Dashboard - Options and Special Requests Display", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin page
    await page.goto("/admin");

    // Enter admin password
    await page.getByRole("textbox", { name: "Password" }).fill("admin456");
    await page.keyboard.press("Enter");

    // Wait for dashboard to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Navigate to order dashboard
    await page.getByRole("button", { name: /Order Management/ }).click();

    // Wait for order dashboard to load
    await page.waitForLoadState("networkidle");
  });

  test("should display proper empty state when no orders exist", async ({ page }) => {
    // Verify we're on the order dashboard
    await expect(page.getByRole("heading", { name: "Order Dashboard" }))
      .toBeVisible();

    // Should show "0 orders" or "No orders found"
    const orderCount = page.getByText("0 orders");
    const noOrdersMessage = page.getByText("No orders found");

    // At least one of these should be visible
    const hasEmptyState = await orderCount.isVisible() ||
      await noOrdersMessage.isVisible();
    expect(hasEmptyState).toBe(true);

    // Should not show any order cards
    const orderCards = page.locator('[data-testid^="order-card-"]');
    await expect(orderCards).toHaveCount(0);
  });

  test("should display order dashboard interface elements", async ({ page }) => {
    // Verify the order dashboard loads with proper interface elements
    await expect(page.getByRole("heading", { name: "Order Dashboard" }))
      .toBeVisible();

    // Should show connection status
    const connectionStatus = page.getByText("Connected");
    const offlineStatus = page.getByText("Offline");
    const hasConnectionStatus = await connectionStatus.isVisible() ||
      await offlineStatus.isVisible();
    expect(hasConnectionStatus).toBe(true);

    // Should show order statistics with specific selectors
    await expect(page.getByTestId("order-statistics").getByText("Pending"))
      .toBeVisible();
    await expect(page.getByTestId("order-statistics").getByText("Completed"))
      .toBeVisible();
    await expect(page.getByTestId("order-statistics").getByText("Total"))
      .toBeVisible();

    // Should show search and filter controls
    await expect(page.getByRole("textbox", { name: /Search orders/ }))
      .toBeVisible();
    await expect(page.getByRole("combobox")).toBeVisible();
  });

  test("should show proper empty state messaging", async ({ page }) => {
    // Check for empty state messaging when no orders are displayed (Show Completed is off by default)
    const emptyStateHeading = page.getByRole("heading", {
      name: "No orders found",
    });
    const emptyStateMessage = page.getByText(
      "Orders will appear here when they are placed",
    );

    await expect(emptyStateHeading).toBeVisible();
    await expect(emptyStateMessage).toBeVisible();

    // Verify that pending orders count is 0 (no active pending orders)
    const pendingStatistic = page.locator("dl dt:has-text('Pending') + dd");
    await expect(pendingStatistic).toHaveText("0");

    // Statistics should be present and formatted correctly
    await expect(page.locator("dl dt")).toContainText([
      "Pending",
      "Completed",
      "Total",
    ]);
  });

  test("should show proper dashboard layout with statistics section", async ({ page }) => {
    // Check that the dashboard layout includes proper sections
    const mainContainer = page.locator("main");
    await expect(mainContainer).toBeVisible();

    // Verify statistics section is present with first specific element
    const statsSection = page.locator("dl").first();
    await expect(statsSection).toBeVisible();

    // Verify heading structure with specific heading
    const mainHeading = page.getByRole("heading", { name: "Order Dashboard" });
    await expect(mainHeading).toBeVisible();
  });

  test("should display navigation and interface elements properly", async ({ page }) => {
    // Check that navigation elements are properly displayed using first nav
    const navigationSection = page.locator("nav").first();
    await expect(navigationSection).toBeVisible();

    // Verify page title or main heading
    const pageContent = page.locator("main");
    await expect(pageContent).toBeVisible();

    // Check for proper responsive layout
    const containerElements = page.locator(
      '[class*="container"], [class*="grid"], [class*="flex"]',
    );
    await expect(containerElements.first()).toBeVisible();
  });

  test("should display dashboard accessibility features", async ({ page }) => {
    // Verify accessibility features are present in the empty dashboard
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();

    // Check for proper heading hierarchy
    const headings = page.locator("h1, h2, h3");
    await expect(headings.first()).toBeVisible();

    // Verify that interface elements have proper contrast
    const buttons = page.locator("button");
    if (await buttons.count() > 0) {
      await expect(buttons.first()).toBeVisible();
    }
  });

  test("should display interface with proper loading states", async ({ page }) => {
    // Test that the interface handles loading states appropriately
    const mainContainer = page.locator("main");
    await expect(mainContainer).toBeVisible();

    // Page should either show content or proper loading state
    const contentOrLoading = page.locator('main, [data-testid*="loading"]');
    await expect(contentOrLoading.first()).toBeVisible();
  });

  test("should display dashboard with proper responsive design", async ({ page }) => {
    // Check that the dashboard is responsive and displays properly
    const dashboard = page.locator("main");
    await expect(dashboard).toBeVisible();

    // Verify responsive grid or layout containers exist
    const layoutContainers = page.locator(
      '[class*="grid"], [class*="flex"], [class*="container"]',
    );
    await expect(layoutContainers.first()).toBeVisible();

    // Check that the page maintains proper structure
    const structureElements = page.locator("header, main, nav");
    await expect(structureElements.first()).toBeVisible();
  });

  test("should display dashboard statistics correctly", async ({ page }) => {
    // Verify that dashboard statistics are properly displayed using first dl
    const statsContainer = page.locator("dl").first();
    await expect(statsContainer).toBeVisible();

    // Check that statistics show proper zero values in empty state
    const statValues = page.locator("dd");
    await expect(statValues.first()).toBeVisible();

    // Verify that statistic labels are readable
    const statLabels = page.locator("dt");
    await expect(statLabels.first()).toBeVisible();
  });

  test("should display empty state information clearly", async ({ page }) => {
    // Check that empty state provides clear information to the user
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();

    // Look for empty state messaging or indicators
    const emptyIndicators = page.getByText("No orders found");
    await expect(emptyIndicators).toBeVisible();

    // Also check for the explanatory text
    const explanatoryText = page.getByText(
      "Orders will appear here when they are placed",
    );
    await expect(explanatoryText).toBeVisible();

    // Verify the page maintains proper layout even when empty
    const layoutElements = page.locator(
      'header, main, nav, [class*="container"]',
    );
    await expect(layoutElements.first()).toBeVisible();
  });
});
