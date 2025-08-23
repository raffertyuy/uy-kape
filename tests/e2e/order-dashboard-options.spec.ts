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
  const ADMIN_PASSWORD = "admin456";

  test.beforeEach(async ({ page }) => {
    // Navigate to admin page
    await page.goto("/admin");

    // Enter admin password
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Navigate to order dashboard
    await page.click('button:has-text("Order Management")');
    await page.click('button:has-text("Orders")');
  });

  test("should display drink options for orders with multiple options", async ({ page }) => {
    // Look for orders with options section
    const optionsSection = page.locator('text="Options:"').first();
    await expect(optionsSection).toBeVisible();

    // Check for common option types
    const optionTypes = [
      "Number of Shots",
      "Temperature",
      "Milk Type",
      "Ice Cream",
    ];

    // Verify at least some option types are displayed
    let foundOptions = 0;
    for (const optionType of optionTypes) {
      const optionElement = page.locator(`text="${optionType}:"`);
      if (await optionElement.count() > 0) {
        foundOptions++;
      }
    }

    expect(foundOptions).toBeGreaterThan(0);
  });

  test("should display special requests when present", async ({ page }) => {
    // Look for special request section
    const specialRequestSection = page.locator('text="Special Request:"');
    await expect(specialRequestSection.first()).toBeVisible();

    // Verify special request content is displayed
    const specialRequestContent = page.locator(
      'text="Special Request:"+following-sibling::p',
    );
    await expect(specialRequestContent.first()).toBeVisible();

    // Verify special request is in quotes (as per OrderCard implementation)
    const quotedRequest = page.locator(
      'text="Special Request:"+following-sibling::p:has-text("\\"")',
    );
    await expect(quotedRequest.first()).toBeVisible();
  });

  test("should display different drink categories with their options", async ({ page }) => {
    // Check for various drink categories
    const categories = [
      "Premium Coffee",
      "Special Drinks",
      "Kids Drinks",
    ];

    let foundCategories = 0;
    for (const category of categories) {
      const categoryElement = page.locator(`text="${category}"`);
      if (await categoryElement.count() > 0) {
        foundCategories++;
      }
    }

    expect(foundCategories).toBeGreaterThan(0);
  });

  test("should display order cards with proper structure", async ({ page }) => {
    // Check that order cards have the expected structure
    const orderCards = page.locator('[data-testid^="order-card-"]');
    const firstCard = orderCards.first();

    await expect(firstCard).toBeVisible();

    // Verify order card contains guest name
    await expect(firstCard.locator("h3")).toBeVisible();

    // Verify order card contains drink name
    await expect(
      firstCard.locator(
        'text="Premium Coffee", text="Special Drinks", text="Kids Drinks"',
      ).first(),
    ).toBeVisible();

    // Verify order card contains status badge
    await expect(firstCard.locator('[role="status"]')).toBeVisible();
  });

  test("should display orders with different option combinations", async ({ page }) => {
    // Test that orders show different combinations of options
    // Check for temperature options
    const temperatureOptions = page.locator(
      'text="Temperature: Hot", text="Temperature: Cold"',
    );
    await expect(temperatureOptions.first()).toBeVisible();

    // Check for shot options
    const shotOptions = page.locator(
      'text="Number of Shots: Single", text="Number of Shots: Double"',
    );
    await expect(shotOptions.first()).toBeVisible();

    // Check for milk type options
    const milkOptions = page.locator('text="Milk Type:"');
    await expect(milkOptions.first()).toBeVisible();
  });

  test("should handle orders without options gracefully", async ({ page }) => {
    // Look for orders that might not have options (e.g., simple drinks)
    const orderCards = page.locator('[data-testid^="order-card-"]');

    // Check that the page loads and displays orders
    await expect(orderCards.first()).toBeVisible();

    // Verify that orders without options don't show an empty options section
    const cardsWithoutOptions = orderCards.filter({
      hasNot: page.locator('text="Options:"'),
    });

    // If there are cards without options, they should still display properly
    if (await cardsWithoutOptions.count() > 0) {
      await expect(cardsWithoutOptions.first()).toBeVisible();
      await expect(cardsWithoutOptions.first().locator("h3")).toBeVisible(); // Guest name
    }
  });

  test("should display option values correctly formatted", async ({ page }) => {
    // Test that option values are displayed in the correct format: "Category: Value"
    const optionElements = page.locator("text=/\\w+:\\s+\\w+/");
    await expect(optionElements.first()).toBeVisible();

    // Verify common option patterns
    const commonOptions = [
      /Number of Shots: (Single|Double)/,
      /Temperature: (Hot|Cold)/,
      /Milk Type: .+/,
    ];

    let foundPatterns = 0;
    for (const pattern of commonOptions) {
      const element = page.locator(`text=${pattern}`);
      if (await element.count() > 0) {
        foundPatterns++;
      }
    }

    expect(foundPatterns).toBeGreaterThan(0);
  });

  test("should display multiple special requests with different content", async ({ page }) => {
    // Check for multiple orders with special requests
    const specialRequestSections = page.locator('text="Special Request:"');
    const specialRequestCount = await specialRequestSections.count();

    if (specialRequestCount > 1) {
      // Verify different special requests have different content
      const firstRequest = page.locator(
        'text="Special Request:"+following-sibling::p',
      ).first();
      const secondRequest = page.locator(
        'text="Special Request:"+following-sibling::p',
      ).nth(1);

      const firstText = await firstRequest.textContent();
      const secondText = await secondRequest.textContent();

      expect(firstText).not.toEqual(secondText);
    }
  });

  test("should maintain order card functionality with enhanced display", async ({ page }) => {
    // Verify that order status updates still work with the enhanced display
    const pendingOrder = page.locator(
      '[data-testid^="order-card-"]:has-text("Pending")',
    ).first();

    if (await pendingOrder.count() > 0) {
      // Check that action buttons are present
      const completeButton = pendingOrder.locator(
        'button:has-text("Complete")',
      );
      await expect(completeButton).toBeVisible();

      const cancelButton = pendingOrder.locator('button:has-text("Cancel")');
      await expect(cancelButton).toBeVisible();
    }
  });

  test("should display queue information along with options", async ({ page }) => {
    // Check that queue information is displayed alongside options
    const orderCards = page.locator('[data-testid^="order-card-"]');
    const firstCard = orderCards.first();

    // Look for queue position or time information
    const queueInfo = firstCard.locator(
      "text=/Queue Position|Ordered:|Est. time:/",
    );
    await expect(queueInfo.first()).toBeVisible();
  });
});
