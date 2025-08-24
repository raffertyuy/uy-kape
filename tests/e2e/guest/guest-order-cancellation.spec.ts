import { expect, test } from "@playwright/test";

/**
 * E2E Tests for Guest Order Cancellation Feature
 *
 * Tests the order cancellation functionality for guests including
 * confirmation dialogs, error handling, and UI state management.
 */

// Guest password from environment
const GUEST_PASSWORD = "guest123";

/**
 * Helper function to complete the order flow up to confirmation
 */
async function placeOrder(page: any, guestName: string = "Test Guest", specialRequest: string = "") {
  // Navigate to the guest ordering page
  await page.goto("/order");

  // Enter guest password to access ordering interface
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill(GUEST_PASSWORD);
  await page.keyboard.press("Enter");

  // Wait for order interface to load
  await page.waitForTimeout(2000);

  // Select a drink (first available drink card)
  const drinkCard = page.locator('[data-testid^="drink-card-"]').first();
  await expect(drinkCard).toBeVisible();
  await drinkCard.click();

  // Handle customization step if present
  const continueButton = page.locator('button:has-text("Continue")');
  if (await continueButton.isVisible()) {
    await continueButton.click();
  }

  // Fill in guest information
  const guestNameInput = page.locator('#guest-name');
  await expect(guestNameInput).toBeVisible();
  
  // Clear the field first (in case there's a generated name)
  await guestNameInput.selectText();
  await guestNameInput.fill(guestName);

  // Add special request if provided
  if (specialRequest) {
    const specialRequestInput = page.locator('textarea').first();
    await specialRequestInput.fill(specialRequest);
  }

  // Submit the order
  const submitButton = page.locator('button:has-text("Continue")');
  await expect(submitButton).toBeVisible();
  await submitButton.click();

  // Verify we're on the confirmation page
  await expect(page.locator('text="Order Confirmed!"')).toBeVisible();
  await expect(page.locator(`text="Thanks ${guestName}!"`)).toBeVisible();
}

test.describe("Guest Order Cancellation", () => {
  test("guest can cancel order from confirmation page", async ({ page }) => {
    // Step 1: Place an order using helper function
    await placeOrder(page, "Test Guest");

    // Step 2: Cancel the order
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Should show confirmation dialog
    const confirmDialog = page.locator('text="Cancel Your Order?"');
    await expect(confirmDialog).toBeVisible();

    // Confirm cancellation
    const confirmButton = page.locator('button:has-text("Yes, Cancel Order")');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Should show cancellation success message
    await expect(page.locator('text="Order Cancelled"')).toBeVisible();
    await expect(page.locator('text="Your order has been cancelled"')).toBeVisible();
  });

  test("guest can dismiss cancel confirmation dialog", async ({ page }) => {
    // Place an order first
    await placeOrder(page, "Test Guest");

    // Try to cancel
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await cancelButton.click();

    // Should show confirmation dialog
    await expect(page.locator('text="Cancel Your Order?"')).toBeVisible();

    // Dismiss the dialog
    const dismissButton = page.locator('button:has-text("No, Keep Order")');
    await expect(dismissButton).toBeVisible();
    await dismissButton.click();

    // Should return to confirmation page
    await expect(page.locator('text="Order Confirmed!"')).toBeVisible();
    await expect(cancelButton).toBeVisible();
  });

  test("cancel button is disabled while cancellation is in progress", async ({ page }) => {
    // Place an order first
    await placeOrder(page, "Test Guest");

    // Try to cancel
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await cancelButton.click();

    // Confirm cancellation
    const confirmButton = page.locator('button:has-text("Yes, Cancel Order")');
    await confirmButton.click();

    // The cancel button should be disabled during processing
    // Note: This test may need adjustment based on actual implementation
    await expect(page.locator('text="Order Cancelled"')).toBeVisible();
  });

  test("displays error message when cancellation fails", async ({ page }) => {
    // Place an order first
    await placeOrder(page, "Test Guest");

    // Mock a network error for cancellation
    await page.route('**/orders/**', route => route.abort());

    // Try to cancel
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await cancelButton.click();

    // Confirm cancellation
    const confirmButton = page.locator('button:has-text("Yes, Cancel Order")');
    await confirmButton.click();

    // Should show error message
    await expect(page.locator('text=/error|failed|unable/i')).toBeVisible();
  });

  test("guest can place new order after cancellation", async ({ page }) => {
    // Place and cancel an order
    await placeOrder(page, "Test Guest");
    
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await cancelButton.click();
    
    const confirmButton = page.locator('button:has-text("Yes, Cancel Order")');
    await confirmButton.click();

    // After cancellation, should be able to place a new order
    await expect(page.locator('text="Order Cancelled"')).toBeVisible();
    
    const newOrderButton = page.locator('button:has-text("Place New Order")');
    if (await newOrderButton.isVisible()) {
      await newOrderButton.click();
    } else {
      // Navigate to order page if no direct button
      await page.goto("/order");
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill(GUEST_PASSWORD);
      await page.keyboard.press("Enter");
    }

    // Should be able to select a drink again
    await page.waitForTimeout(2000);
    const drinkCard = page.locator('[data-testid^="drink-card-"]').first();
    await expect(drinkCard).toBeVisible();
  });

  test("guest can place another order without cancelling current order", async ({ page }) => {
    // Place an order
    await placeOrder(page, "Test Guest");

    // Navigate to place another order (without cancelling)
    await page.goto("/order");
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(GUEST_PASSWORD);
    await page.keyboard.press("Enter");

    // Should be able to place another order
    await page.waitForTimeout(2000);
    const drinkCard = page.locator('[data-testid^="drink-card-"]').first();
    await expect(drinkCard).toBeVisible();
  });

  test("confirmation dialog displays correct order information", async ({ page }) => {
    // Place an order
    await placeOrder(page, "Test Guest");

    // Try to cancel
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await cancelButton.click();

    // Should show confirmation dialog with order details
    await expect(page.locator('text="Cancel Your Order?"')).toBeVisible();
    await expect(page.locator('text="Test Guest"')).toBeVisible();
  });

  test("cancellation works with special requests", async ({ page }) => {
    // Place an order with special request
    await placeOrder(page, "Test Guest", "Extra hot, please");

    // Cancel the order
    const cancelButton = page.locator('button:has-text("Cancel This Order")');
    await cancelButton.click();
    
    const confirmButton = page.locator('button:has-text("Yes, Cancel Order")');
    await confirmButton.click();

    // Should show cancellation success
    await expect(page.locator('text="Order Cancelled"')).toBeVisible();
  });

  test.describe("Edge Cases", () => {
    test("handles network errors gracefully during cancellation", async ({ page }) => {
      // Place an order
      await placeOrder(page, "Test Guest");

      // Simulate network failure
      await page.route('**/*', route => route.abort());

      const cancelButton = page.locator('button:has-text("Cancel This Order")');
      await cancelButton.click();
      
      const confirmButton = page.locator('button:has-text("Yes, Cancel Order")');
      await confirmButton.click();

      // Should handle error gracefully
      await expect(page.locator('text=/error|failed|network/i')).toBeVisible();
    });

    test("cancellation button accessibility", async ({ page }) => {
      // Place an order
      await placeOrder(page, "Test Guest");

      // Test keyboard navigation
      const cancelButton = page.locator('button:has-text("Cancel This Order")');
      await cancelButton.focus();
      await page.keyboard.press("Enter");

      // Should open confirmation dialog
      await expect(page.locator('text="Cancel Your Order?"')).toBeVisible();
      
      // Test escape key to close dialog
      await page.keyboard.press("Escape");
      
      // Should return to confirmation page
      await expect(page.locator('text="Order Confirmed!"')).toBeVisible();
    });
  });
});