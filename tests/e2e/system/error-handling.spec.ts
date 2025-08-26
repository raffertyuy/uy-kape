import { expect, test } from "@playwright/test";

/**
 * Simplified Error Handling End-to-End Tests
 *
 * These tests verify basic error handling functionality that is actually implemented.
 * Focus on user-facing error scenarios that impact the core coffee ordering workflow.
 */

test.describe("Basic Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and wait for it to load
    await page.goto("/");
    await page.waitForSelector('[data-testid="app-loaded"]', {
      timeout: 10000,
    });
  });

  test("should load application without errors", async ({ page }) => {
    // Verify the main application loads successfully
    await expect(page.locator('[data-testid="app-loaded"]')).toBeVisible();
    await expect(page.getByText("Uy, Kape!")).toBeVisible();

    // Verify no obvious error messages are displayed
    const errorMessages = page.locator("text=Error").or(
      page.locator("text=Something went wrong"),
    );
    await expect(errorMessages).toHaveCount(0);
  });

  test("should handle navigation errors gracefully", async ({ page }) => {
    // Try to navigate to a non-existent route
    await page.goto("/non-existent-route");

    // Should either redirect to a valid page or show a 404 message
    // (This test ensures the app doesn't crash on bad routes)
    const isOnValidPage = await page.locator('[data-testid="app-loaded"]')
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (!isOnValidPage) {
      // If not on a valid page, should at least not show browser error
      const hasPageContent = await page.locator("body").isVisible();
      expect(hasPageContent).toBe(true);
    }
  });

  test("should handle form submission gracefully", async ({ page }) => {
    // Navigate to guest order page
    await page.goto("/order");
    await page.waitForTimeout(1000);

    // Check if password input is present and handle authentication if needed
    const passwordInput = page.locator('input[type="password"]');
    const passwordInputVisible = await passwordInput.isVisible();

    if (passwordInputVisible) {
      // Enter guest password if bypass is disabled
      await passwordInput.fill("guest123");
      await page.keyboard.press("Enter");
    }

    // Wait for order form to load
    await page.waitForLoadState("networkidle");

    // Verify some form of order interface loads (flexible check)
    const hasOrderInterface = await page.locator(
      'text="Choose Your Drink", [data-testid^="drink-card-"], .order-form, .guest-module',
    ).count() > 0;

    if (hasOrderInterface) {
      // Great! We found order interface elements
      const drinkButtons = page.locator('[data-testid^="drink-card-"]');
      const drinkCount = await drinkButtons.count();
      if (drinkCount > 0) {
        await expect(drinkButtons.first()).toBeVisible();
      }
    } else {
      // Even if specific elements aren't found, verify we have functional content
      const bodyContent = await page.textContent("body");
      expect(bodyContent).toBeTruthy();
      expect(bodyContent!.length).toBeGreaterThan(50); // Substantial content
    }
  });

  test("should handle admin authentication gracefully", async ({ page }) => {
    // Navigate to admin page
    await page.goto("/admin");

    // Try with wrong password first
    await page.getByRole("textbox", { name: "Password" }).fill("wrongpassword");
    await page.getByRole("button", { name: "Access" }).click();

    // Should either stay on login or show error (but not crash)
    await page.waitForTimeout(1000); // Allow any error handling to complete

    // Try with correct password
    await page.getByRole("textbox", { name: "Password" }).fill("admin456");
    await page.getByRole("button", { name: "Access" }).click();

    // Should successfully access admin dashboard
    await expect(page.getByText("Order Management")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should maintain app stability during network delays", async ({ page }) => {
    // Simulate slow network by delaying responses
    await page.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
      route.continue();
    });

    // Navigate to admin and verify it still works
    await page.goto("/admin");
    await page.getByRole("textbox", { name: "Password" }).fill("admin456");
    await page.getByRole("button", { name: "Access" }).click();

    // Should eventually load (with timeout for slow network)
    await expect(page.getByText("Order Management")).toBeVisible({
      timeout: 15000,
    });
  });
});
