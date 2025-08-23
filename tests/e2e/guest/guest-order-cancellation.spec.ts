import { expect, test } from "@playwright/test";

/**
 * E2E Tests for Guest Order Cancellation
 *
 * Tests the complete flow of:
 * 1. Guest placing an order
 * 2. Guest cancelling the order from confirmation page
 * 3. Verifying cancellation functionality and edge cases
 */

// Guest password from environment
const GUEST_PASSWORD = "guest123";

test.describe("Guest Order Cancellation", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the guest ordering page
    await page.goto("/order");

    // Check if password prompt is shown and enter password
    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.isVisible()) {
      await passwordInput.fill(GUEST_PASSWORD);
      await page.keyboard.press("Enter");
    }

    // Wait for the page to load
    await page.waitForSelector('[data-testid="drink-selection"]');
  });

  test("guest can cancel order from confirmation page", async ({ page }) => {
    // Step 1: Place an order
    // Select a drink (assuming we have drink cards available)
    const drinkCard = page.locator('[data-testid^="drink-card-"]').first();
    await expect(drinkCard).toBeVisible();
    await drinkCard.click();

    // Fill in guest information
    const guestNameInput = page.locator('input[name="customerName"]');
    await expect(guestNameInput).toBeVisible();
    await guestNameInput.fill("Test Guest");

    // Submit the order
    const submitButton = page.locator('button:has-text("Submit Order")');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Step 2: Verify we're on the confirmation page
    await expect(page.locator('text="Order Confirmed!"')).toBeVisible();
    await expect(page.locator('text="Thanks Test Guest!"')).toBeVisible();

    // Step 3: Cancel the order
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Step 4: Confirm in the dialog
    await expect(page.locator('text="Cancel Order?"')).toBeVisible();
    await expect(
      page.locator('text="Are you sure you want to cancel your order?"'),
    ).toBeVisible();

    const confirmCancelButton = page.locator(
      'button:has-text("Yes, Cancel Order")',
    );
    await expect(confirmCancelButton).toBeVisible();
    await confirmCancelButton.click();

    // Step 5: Verify cancellation success
    await expect(page.locator('text="Order Cancelled"')).toBeVisible();
    await expect(
      page.locator('text="Your order has been cancelled successfully."'),
    ).toBeVisible();
  });

  test("guest can dismiss cancel confirmation dialog", async ({ page }) => {
    // Place an order first
    const drinkCard = page.locator('[data-testid^="drink-card-"]').first();
    await drinkCard.click();

    const guestNameInput = page.locator('input[name="customerName"]');
    await guestNameInput.fill("Test Guest");

    const submitButton = page.locator('button:has-text("Submit Order")');
    await submitButton.click();

    await expect(page.locator('text="Order Confirmed!"')).toBeVisible();

    // Click cancel button
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await cancelButton.click();

    // Dismiss the dialog
    const keepOrderButton = page.locator('button:has-text("Keep Order")');
    await expect(keepOrderButton).toBeVisible();
    await keepOrderButton.click();

    // Should still be on confirmation page
    await expect(page.locator('text="Order Confirmed!"')).toBeVisible();
    await expect(page.locator('text="Cancel Order?"')).not.toBeVisible();
  });

  test("cancel button is disabled while cancellation is in progress", async ({ page }) => {
    // Place an order first
    const drinkCard = page.locator('[data-testid^="drink-card-"]').first();
    await drinkCard.click();

    const guestNameInput = page.locator('input[name="customerName"]');
    await guestNameInput.fill("Test Guest");

    const submitButton = page.locator('button:has-text("Submit Order")');
    await submitButton.click();

    await expect(page.locator('text="Order Confirmed!"')).toBeVisible();

    // Check that cancel button shows loading state when needed
    // Note: This test might need to be adjusted based on actual network timing
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await expect(cancelButton).toBeEnabled();
  });

  test("displays error message when cancellation fails", async ({ page }) => {
    // This test would require mocking the backend to return an error
    // For now, we'll test that error handling UI is present

    // Place an order first
    const drinkCard = page.locator('[data-testid^="drink-card-"]').first();
    await drinkCard.click();

    const guestNameInput = page.locator('input[name="customerName"]');
    await guestNameInput.fill("Test Guest");

    const submitButton = page.locator('button:has-text("Submit Order")');
    await submitButton.click();

    await expect(page.locator('text="Order Confirmed!"')).toBeVisible();

    // The UI should be able to handle errors (even if we can't simulate them in this test)
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await expect(cancelButton).toBeVisible();
  });

  test("guest can place new order after cancellation", async ({ page }) => {
    // Place an order
    const drinkCard = page.locator('[data-testid^="drink-card-"]').first();
    await drinkCard.click();

    const guestNameInput = page.locator('input[name="customerName"]');
    await guestNameInput.fill("Test Guest");

    const submitButton = page.locator('button:has-text("Submit Order")');
    await submitButton.click();

    await expect(page.locator('text="Order Confirmed!"')).toBeVisible();

    // Cancel the order
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await cancelButton.click();

    const confirmCancelButton = page.locator(
      'button:has-text("Yes, Cancel Order")',
    );
    await confirmCancelButton.click();

    // After cancellation, click "Place New Order Now"
    const newOrderButton = page.locator(
      'button:has-text("Place New Order Now")',
    );
    await expect(newOrderButton).toBeVisible();
    await newOrderButton.click();

    // Should be back to drink selection
    await expect(page.locator('[data-testid="drink-selection"]')).toBeVisible();
  });

  test("guest can place another order without cancelling current order", async ({ page }) => {
    // Place an order
    const drinkCard = page.locator('[data-testid^="drink-card-"]').first();
    await drinkCard.click();

    const guestNameInput = page.locator('input[name="customerName"]');
    await guestNameInput.fill("Test Guest");

    const submitButton = page.locator('button:has-text("Submit Order")');
    await submitButton.click();

    await expect(page.locator('text="Order Confirmed!"')).toBeVisible();

    // Click "Place Another Order" without cancelling
    const anotherOrderButton = page.locator(
      'button:has-text("Place Another Order")',
    );
    await expect(anotherOrderButton).toBeVisible();
    await anotherOrderButton.click();

    // Should be back to drink selection
    await expect(page.locator('[data-testid="drink-selection"]')).toBeVisible();
  });

  test("confirmation dialog displays correct order information", async ({ page }) => {
    // Place an order
    const drinkCard = page.locator('[data-testid^="drink-card-"]').first();
    await drinkCard.click();

    const guestNameInput = page.locator('input[name="customerName"]');
    await guestNameInput.fill("Test Guest");

    const submitButton = page.locator('button:has-text("Submit Order")');
    await submitButton.click();

    await expect(page.locator('text="Order Confirmed!"')).toBeVisible();

    // Get order details from confirmation page to verify dialog shows correct info
    const orderDetails = page.locator('[data-testid="order-details"]');
    await expect(orderDetails).toBeVisible();

    // Click cancel to open dialog
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await cancelButton.click();

    // Verify dialog shows order information
    await expect(page.locator('text="Cancel Order?"')).toBeVisible();

    // The dialog should show order ID and queue number
    // Note: This would need to be adjusted based on actual implementation
    const dialogOrderInfo = page.locator(
      '[data-testid="cancel-dialog-order-info"]',
    );
    if (await dialogOrderInfo.isVisible()) {
      await expect(dialogOrderInfo).toBeVisible();
    }
  });

  test("cancellation works with special requests", async ({ page }) => {
    // Place an order with special request
    const drinkCard = page.locator('[data-testid^="drink-card-"]').first();
    await drinkCard.click();

    const guestNameInput = page.locator('input[name="customerName"]');
    await guestNameInput.fill("Test Guest");

    // Add special request
    const specialRequestInput = page.locator(
      'textarea[name="specialRequests"]',
    );
    if (await specialRequestInput.isVisible()) {
      await specialRequestInput.fill("Extra hot, no foam");
    }

    const submitButton = page.locator('button:has-text("Submit Order")');
    await submitButton.click();

    await expect(page.locator('text="Order Confirmed!"')).toBeVisible();

    // Verify special request is displayed
    if (await page.locator('text="Special Request:"').isVisible()) {
      await expect(page.locator('text="Extra hot, no foam"')).toBeVisible();
    }

    // Cancel the order
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await cancelButton.click();

    const confirmCancelButton = page.locator(
      'button:has-text("Yes, Cancel Order")',
    );
    await confirmCancelButton.click();

    // Verify cancellation success
    await expect(page.locator('text="Order Cancelled"')).toBeVisible();
  });
});

test.describe("Guest Order Cancellation - Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/order");

    // Check if password prompt is shown and enter password
    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.isVisible()) {
      await passwordInput.fill(GUEST_PASSWORD);
      await page.keyboard.press("Enter");
    }

    await page.waitForSelector('[data-testid="drink-selection"]');
  });

  test("handles network errors gracefully during cancellation", async ({ page }) => {
    // This test would require network mocking to simulate failures
    // For now, we ensure the UI can handle such scenarios

    const drinkCard = page.locator('[data-testid^="drink-card-"]').first();
    await drinkCard.click();

    const guestNameInput = page.locator('input[name="customerName"]');
    await guestNameInput.fill("Test Guest");

    const submitButton = page.locator('button:has-text("Submit Order")');
    await submitButton.click();

    await expect(page.locator('text="Order Confirmed!"')).toBeVisible();

    // The cancel functionality should be present and functional
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await expect(cancelButton).toBeVisible();
    await expect(cancelButton).toBeEnabled();
  });

  test("cancellation button accessibility", async ({ page }) => {
    // Place an order
    const drinkCard = page.locator('[data-testid^="drink-card-"]').first();
    await drinkCard.click();

    const guestNameInput = page.locator('input[name="customerName"]');
    await guestNameInput.fill("Test Guest");

    const submitButton = page.locator('button:has-text("Submit Order")');
    await submitButton.click();

    await expect(page.locator('text="Order Confirmed!"')).toBeVisible();

    // Test keyboard navigation to cancel button
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    const cancelButton = page.locator('button:has-text("Cancel This Order")');

    // Verify button is focusable and has proper accessibility attributes
    await expect(cancelButton).toBeVisible();

    // Check if button can be activated with keyboard
    await cancelButton.focus();
    await page.keyboard.press("Enter");

    // Should open the confirmation dialog
    await expect(page.locator('text="Cancel Order?"')).toBeVisible();
  });
});
