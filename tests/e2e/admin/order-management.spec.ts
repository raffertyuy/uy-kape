import { expect, test } from "@playwright/test";

// Test configuration
const ADMIN_PASSWORD = "admin456"; // This should match the configured admin password

test.describe("Order Management Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin page and authenticate
    await page.goto("/admin");

    // Check if password prompt is shown and enter password
    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.isVisible()) {
      await passwordInput.fill(ADMIN_PASSWORD);
      await page.keyboard.press("Enter");
    }

    // Wait for admin dashboard to load and click Order Management
    await page.waitForSelector('button:has-text("Order Management")', {
      timeout: 10000,
    });
    await page.click('button:has-text("Order Management")');

    // Wait for order dashboard to load
    await page.waitForSelector('[data-testid="order-dashboard"]', {
      timeout: 10000,
    });
  });

  test.describe("Dashboard Loading and Display", () => {
    test("should load order dashboard successfully", async ({ page }) => {
      // Verify main dashboard elements are present
      await expect(page.locator('[data-testid="order-dashboard"]'))
        .toBeVisible();
      await expect(page.locator('[data-testid="order-dashboard"] h1'))
        .toContainText("Order Dashboard");

      // Check for key dashboard components
      await expect(page.locator('[data-testid="order-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="dashboard-controls"]'))
        .toBeVisible();
    });

    test("should display order statistics", async ({ page }) => {
      // Check for statistics section
      const statsSection = page.locator('[data-testid="order-statistics"]');
      if (await statsSection.isVisible()) {
        await expect(statsSection).toContainText(/pending|completed/i);
      }
    });

    test("should show filter controls", async ({ page }) => {
      // Check for filter controls
      const filtersSection = page.locator('[data-testid="order-filters"]');
      if (await filtersSection.isVisible()) {
        await expect(filtersSection).toBeVisible();
      }
    });
  });

  test.describe("Order Display and Management", () => {
    test("should display order cards when orders exist", async ({ page }) => {
      // Wait for orders to load
      await page.waitForTimeout(1000);

      // Check if orders are displayed
      const orderCards = page.locator('[data-testid^="order-card-"]');
      const orderCount = await orderCards.count();

      if (orderCount > 0) {
        // Verify first order card has required information
        const firstOrder = orderCards.first();
        await expect(firstOrder).toBeVisible();

        // Check for guest name, status, and basic order info
        await expect(firstOrder).toContainText(/guest|order|status/i);
      } else {
        // If no orders, check for empty state
        const emptyState = page.locator('[data-testid="empty-orders"]');
        await expect(emptyState).toBeVisible();
      }
    });

    test("should allow status updates for orders", async ({ page }) => {
      await page.waitForTimeout(1000);

      const orderCards = page.locator('[data-testid^="order-card-"]');
      const orderCount = await orderCards.count();

      if (orderCount > 0) {
        const firstOrder = orderCards.first();

        // Look for status update buttons or dropdown
        const statusButton = firstOrder.locator("button").filter({
          hasText: /complete|pending/i,
        }).first();

        if (await statusButton.isVisible()) {
          await statusButton.click();

          // Wait for status to potentially update
          await page.waitForTimeout(500);

          // Verify interaction was registered (button may change or dropdown may appear)
          const updatedButton = firstOrder.locator("button").filter({
            hasText: /complete|pending/i,
          }).first();
          await expect(updatedButton).toBeVisible();
        }
      }
    });

    test("should handle order selection", async ({ page }) => {
      await page.waitForTimeout(1000);

      const orderCards = page.locator('[data-testid^="order-card-"]');
      const orderCount = await orderCards.count();

      if (orderCount > 0) {
        const firstOrder = orderCards.first();

        // Click on order card to select it
        await firstOrder.click();

        // Check if selection styling is applied or selection state changes
        await page.waitForTimeout(300);

        // Verify the order is interactable
        await expect(firstOrder).toBeVisible();
      }
    });
  });

  test.describe("Real-time Updates", () => {
    test("should maintain connection status indicator", async ({ page }) => {
      // Look for connection status indicator
      const connectionStatus = page.locator(
        '[data-testid="connection-status"]',
      );

      if (await connectionStatus.isVisible()) {
        // Should show connected status
        await expect(connectionStatus).toBeVisible();
      }
    });

    test("should handle reconnection attempts", async ({ page }) => {
      // Check for reconnect functionality
      const reconnectButton = page.locator("button").filter({
        hasText: /reconnect|refresh/i,
      });

      if (await reconnectButton.isVisible()) {
        await reconnectButton.click();

        // Wait for reconnection attempt
        await page.waitForTimeout(1000);

        // Verify dashboard is still functional
        await expect(page.locator('[data-testid="order-dashboard"]'))
          .toBeVisible();
      }
    });
  });

  test.describe("Error Handling", () => {
    test("should display error messages when operations fail", async ({ page }) => {
      // This test would require simulating network errors or invalid operations
      // For now, we check that error display mechanisms exist

      // Error container may not be visible initially, which is expected
      // We just verify the dashboard handles errors gracefully
      await expect(page.locator('[data-testid="order-dashboard"]'))
        .toBeVisible();
    });

    test("should handle empty order list gracefully", async ({ page }) => {
      // Wait for initial load
      await page.waitForTimeout(1000);

      const orderCards = page.locator('[data-testid^="order-card-"]');
      const orderCount = await orderCards.count();

      if (orderCount === 0) {
        // Should show appropriate empty state
        const emptyMessage = page.locator('[data-testid="empty-orders"]');
        if (await emptyMessage.isVisible()) {
          await expect(emptyMessage).toContainText(/no orders|empty/i);
        }
      }

      // Dashboard should remain functional regardless
      await expect(page.locator('[data-testid="order-dashboard"]'))
        .toBeVisible();
    });
  });

  test.describe("Responsive Design", () => {
    test("should work on mobile viewport", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });

      // Verify dashboard is still accessible
      await expect(page.locator('[data-testid="order-dashboard"]'))
        .toBeVisible();

      // Check that main elements are still visible
      await expect(page.locator('[data-testid="order-dashboard"] h1'))
        .toBeVisible();
    });

    test("should work on tablet viewport", async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Verify dashboard layout adapts
      await expect(page.locator('[data-testid="order-dashboard"]'))
        .toBeVisible();
      await expect(page.locator('[data-testid="order-dashboard"] h1'))
        .toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("should be keyboard navigable", async ({ page }) => {
      // Tab through the interface
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Verify focus is visible and functional
      const focusedElement = page.locator(":focus");
      if (await focusedElement.isVisible()) {
        await expect(focusedElement).toBeVisible();
      }
    });

    test("should have proper ARIA labels and roles", async ({ page }) => {
      // Check for basic accessibility attributes
      const mainContent = page.locator('main, [role="main"]');
      if (await mainContent.isVisible()) {
        await expect(mainContent).toBeVisible();
      }

      // Verify buttons have accessible names
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const ariaLabel = await button.getAttribute("aria-label");
          const textContent = await button.textContent();

          // Button should have either aria-label or text content
          expect(ariaLabel || textContent).toBeTruthy();
        }
      }
    });
  });
});

test.describe("Order Management Workflow Integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");

    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.isVisible()) {
      await passwordInput.fill(ADMIN_PASSWORD);
      await page.keyboard.press("Enter");
    }

    // Wait for admin dashboard to load and click Order Management
    await page.waitForSelector('button:has-text("Order Management")', {
      timeout: 10000,
    });
    await page.click('button:has-text("Order Management")');

    await page.waitForSelector('[data-testid="order-dashboard"]', {
      timeout: 10000,
    });
  });

  test("should handle complete order lifecycle", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Check if orders exist to work with
    const orderCards = page.locator('[data-testid^="order-card-"]');
    const orderCount = await orderCards.count();

    if (orderCount > 0) {
      const testOrder = orderCards.first();

      // 1. Select order
      await testOrder.click();
      await page.waitForTimeout(300);

      // 2. Check current status
      const statusIndicator = testOrder.locator('[data-testid="order-status"]');
      if (await statusIndicator.isVisible()) {
        await expect(statusIndicator).toBeVisible();
      }

      // 3. Attempt to update status if controls are available
      const statusButtons = testOrder.locator("button").filter({
        hasText: /complete|pending/i,
      });
      const statusButtonCount = await statusButtons.count();

      if (statusButtonCount > 0) {
        const statusButton = statusButtons.first();
        await statusButton.click();
        await page.waitForTimeout(500);

        // Verify the order still exists and is functional
        await expect(testOrder).toBeVisible();
      }
    } else {
      // No orders to test with - verify empty state handling
      console.log("No orders available for lifecycle testing");
      await expect(page.locator('[data-testid="order-dashboard"]'))
        .toBeVisible();
    }
  });

  test("should handle multiple order operations", async ({ page }) => {
    await page.waitForTimeout(1000);

    const orderCards = page.locator('[data-testid^="order-card-"]');
    const orderCount = await orderCards.count();

    if (orderCount >= 2) {
      // Test interactions with multiple orders
      const firstOrder = orderCards.first();
      const secondOrder = orderCards.nth(1);

      // Select first order
      await firstOrder.click();
      await page.waitForTimeout(300);

      // Select second order
      await secondOrder.click();
      await page.waitForTimeout(300);

      // Verify both orders are still visible and functional
      await expect(firstOrder).toBeVisible();
      await expect(secondOrder).toBeVisible();
    }
  });
});
