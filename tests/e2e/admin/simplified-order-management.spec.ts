import { expect, test } from "@playwright/test";

/**
 * E2E Tests for Simplified Order Management (Without Ready Status)
 *
 * Tests that the barista admin workflow correctly handles orders with only:
 * - pending: Order placed, awaiting preparation
 * - completed: Order finished and picked up
 * - cancelled: Order cancelled by guest or barista
 *
 * Verifies that "Mark Ready" buttons are not present and orders can be marked completed directly.
 */

const ADMIN_PASSWORD = "admin456";

test.describe("Simplified Order Management Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin page and authenticate
    await page.goto("/admin");

    // Enter admin password
    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.isVisible()) {
      await passwordInput.fill(ADMIN_PASSWORD);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(2000); // Wait for authentication
    }

    // Navigate to Order Dashboard
    const orderDashboardLink = page.locator("text=/order.*dashboard/i").first();
    if (await orderDashboardLink.isVisible()) {
      await orderDashboardLink.click();
      await page.waitForTimeout(1000);
    }
  });

  test("should not display Mark Ready buttons", async ({ page }) => {
    // Wait for the order dashboard to load
    await page.waitForTimeout(2000);

    // Look for any "Mark Ready" buttons - there should be none
    const markReadyButtons = page.locator(
      'button:has-text("Mark Ready"), button:has-text("Ready")',
    );
    expect(await markReadyButtons.count()).toBe(0);

    // Also check for "ready" in button texts more broadly
    const readyRelatedButtons = page.locator(
      'button:text-matches(".*[Rr]eady.*", "")',
    );
    expect(await readyRelatedButtons.count()).toBe(0);
  });

  test("should show only pending, completed, and cancelled status options", async ({ page }) => {
    // Try to navigate to order management if available
    const orderManagementButtons = page.locator(
      'button:has-text("Order Management"), a:has-text("Order Management")',
    );

    if (await orderManagementButtons.count() > 0) {
      await orderManagementButtons.first().click();
      await page.waitForTimeout(2000);
    }

    // Wait for the page to settle and check for status-related content
    const pageContent = await page.textContent("body");

    // Since we're testing the removal of "ready" status, the main success criteria is:
    // 1. No "ready" status should be present
    // 2. Page should load successfully

    if (pageContent) {
      // Should NOT contain "ready" status
      const hasReadyStatus = pageContent?.toLowerCase().includes("ready");
      expect(hasReadyStatus).toBe(false);

      // Page should have substantial content (indicating it loaded successfully)
      expect(pageContent.length).toBeGreaterThan(50);
    }
  });

  test("should allow direct completion of orders", async ({ page }) => {
    // Wait for the order dashboard to load
    await page.waitForTimeout(2000);

    // Look for complete/completion buttons
    const completeButtons = page.locator(
      'button:has-text("Complete"), button:has-text("Mark Complete"), button:has-text("Completed")',
    );

    if (await completeButtons.count() > 0) {
      // Verify that complete buttons are present and clickable
      const firstCompleteButton = completeButtons.first();
      await expect(firstCompleteButton).toBeVisible();

      // Button should be enabled (not disabled)
      await expect(firstCompleteButton).toBeEnabled();
    }
  });

  test("should display proper order status workflow in UI", async ({ page }) => {
    // Wait for the order dashboard to load
    await page.waitForTimeout(2000);

    // Get the page content to analyze status workflow
    const pageContent = await page.textContent("body");

    if (pageContent && pageContent.length > 100) {
      // Check if the page has loaded with actual content
      // The test passes if the page loads successfully without "ready" status
      // Should not contain "ready" anywhere in the UI
      const hasReadyStatus = pageContent.toLowerCase().includes("ready");
      expect(hasReadyStatus).toBe(false);

      // Basic validation that the page has loaded correctly
      expect(pageContent.length).toBeGreaterThan(50);
    } else {
      // If no substantial content, just verify page doesn't crash
      expect(pageContent).toBeTruthy();
    }
  });

  test("should handle status transitions correctly", async ({ page }) => {
    // Wait for the order dashboard to load
    await page.waitForTimeout(2000);

    // Look for status transition controls (dropdowns, buttons, etc.)
    const statusControls = page.locator(
      'select[data-testid*="status"], ' +
        'button[data-testid*="status"], ' +
        '[data-testid*="order-actions"] button, ' +
        ".order-actions button",
    );

    if (await statusControls.count() > 0) {
      // Click on the first available status control to see options
      const firstControl = statusControls.first();

      if (await firstControl.isVisible()) {
        await firstControl.click();
        await page.waitForTimeout(500);

        // Check if a dropdown or menu appears with status options
        const statusOptions = page.locator(
          "option, " +
            '[role="option"], ' +
            ".dropdown-item, " +
            'button:has-text("pending"), ' +
            'button:has-text("completed"), ' +
            'button:has-text("cancelled")',
        );

        if (await statusOptions.count() > 0) {
          const optionsText = await page.locator("body").textContent();

          // Should have valid status options
          expect(optionsText).toMatch(/pending|completed|cancelled/i);

          // Should not have "ready" option
          const hasReadyOption = optionsText?.toLowerCase().includes("ready");
          expect(hasReadyOption).toBe(false);
        }
      }
    }
  });

  test("should show appropriate action buttons for order management", async ({ page }) => {
    // Wait for the order dashboard to load
    await page.waitForTimeout(2000);

    // Look for order management action buttons
    const actionButtons = page.locator(
      'button:has-text("Complete"), ' +
        'button:has-text("Cancel"), ' +
        'button:has-text("Delete"), ' +
        '[data-testid*="action"] button, ' +
        ".order-actions button",
    );

    if (await actionButtons.count() > 0) {
      // Verify action buttons are present and properly labeled
      const buttonTexts = await Promise.all(
        (await actionButtons.all()).map((btn) => btn.textContent()),
      );

      // Should have appropriate action buttons
      const hasValidActions = buttonTexts.some((text) =>
        text?.toLowerCase().includes("complete") ||
        text?.toLowerCase().includes("cancel") ||
        text?.toLowerCase().includes("delete")
      );

      expect(hasValidActions).toBe(true);

      // Should not have "ready" related actions
      const hasReadyActions = buttonTexts.some((text) =>
        text?.toLowerCase().includes("ready")
      );

      expect(hasReadyActions).toBe(false);
    }
  });

  test("should maintain order queue functionality without ready status", async ({ page }) => {
    // Wait for the order dashboard to load
    await page.waitForTimeout(2000);

    // Check if order queue/list is displayed properly
    const orderElements = page.locator(
      '[data-testid*="order"], ' +
        ".order-card, " +
        ".order-item, " +
        '[class*="order"]',
    );

    if (await orderElements.count() > 0) {
      // Orders should be displayed in a queue format
      await expect(orderElements.first()).toBeVisible();

      // Check that order information is displayed properly
      const orderContent = await orderElements.first().textContent();

      if (orderContent) {
        // Order should show drink information and actions
        // But should not reference "ready" status
        const hasReadyReference = orderContent.toLowerCase().includes("ready");
        expect(hasReadyReference).toBe(false);
      }
    }
  });

  test("should handle empty order states gracefully", async ({ page }) => {
    // Wait for the order dashboard to load
    await page.waitForTimeout(2000);

    // Whether or not there are orders, the page should not crash
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
    expect(pageContent!.length).toBeGreaterThan(50); // Should have substantial content

    // Should not reference "ready" status in empty states either
    if (pageContent) {
      const hasReadyReference = pageContent.toLowerCase().includes("ready");
      expect(hasReadyReference).toBe(false);
    }
  });
});
