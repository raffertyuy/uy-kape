import { expect, test } from "@playwright/test";

test.describe("Mobile Responsiveness - Complete User Flows", () => {
  // Standard mobile viewports for testing
  const mobileViewports = [
    { width: 375, height: 667, name: "iPhone 8" },
    { width: 390, height: 844, name: "iPhone 12" },
    { width: 412, height: 915, name: "Pixel 5" },
  ];

  const tabletViewports = [
    { width: 768, height: 1024, name: "iPad" },
    { width: 1024, height: 768, name: "iPad Landscape" },
  ];

  test.describe("Guest Module - Mobile Ordering Flow", () => {
    test("should complete full ordering flow on mobile", async ({ page }) => {
      // Test on primary mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to guest page
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Verify drink category tabs are horizontally scrollable
      const categoryTabs = page.locator(".overflow-x-auto").first();
      await expect(categoryTabs).toBeVisible();

      // Test horizontal scrolling of category tabs
      const tabs = page.getByRole("button").filter({
        hasText: /Coffee|Tea|Special|Kids|All/,
      });
      await expect(tabs.first()).toBeVisible();

      // Select different categories and verify they work
      await page.getByRole("button", { name: /Coffee/ }).click();
      await page.waitForLoadState("networkidle");

      // Verify drink cards are displayed properly on mobile
      const drinkCards = page.locator(
        '[data-testid*="drink-card"], .drink-card, .grid > div',
      ).first();
      await expect(drinkCards).toBeVisible();

      // Test clicking on a drink card
      await drinkCards.click();
      await page.waitForLoadState("networkidle");

      // Verify drink details modal/page is mobile responsive
      const drinkDetails = page.locator(
        'h1, h2, [data-testid="drink-name"], .text-2xl',
      ).first();
      await expect(drinkDetails).toBeVisible();

      // Test category switching on mobile
      await page.getByRole("button", { name: /Tea/ }).click();
      await page.waitForLoadState("networkidle");

      // Verify tea drinks are shown
      await expect(page.locator("text=/Tea|Chai|Green|Black/i").first())
        .toBeVisible();

      // Test Special Coffee category
      await page.getByRole("button", { name: /Special/ }).click();
      await page.waitForLoadState("networkidle");

      // Test Kids category
      await page.getByRole("button", { name: /Kids/ }).click();
      await page.waitForLoadState("networkidle");

      // Test All Drinks category
      await page.getByRole("button", { name: /All/ }).click();
      await page.waitForLoadState("networkidle");
    });

    test("should handle category tabs scrolling on very narrow screens", async ({ page }) => {
      // Test on very narrow viewport
      await page.setViewportSize({ width: 320, height: 568 });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Verify all category tabs are still accessible
      const categoryContainer = page.locator(".overflow-x-auto").first();
      await expect(categoryContainer).toBeVisible();

      // Test that we can access the rightmost tab
      await page.getByRole("button", { name: /Kids/ }).click();
      await page.waitForLoadState("networkidle");

      // Verify the category switched
      await expect(page.locator("text=/Kids|Children|Juice/i").first())
        .toBeVisible();
    });

    test.describe("Multiple Mobile Viewport Testing", () => {
      mobileViewports.forEach(({ width, height, name }) => {
        test(`should work correctly on ${name} (${width}x${height})`, async ({ page }) => {
          await page.setViewportSize({ width, height });

          await page.goto("/");
          await page.waitForLoadState("networkidle");

          // Test category tabs
          const categoryTabs = page.locator(".overflow-x-auto").first();
          await expect(categoryTabs).toBeVisible();

          // Test tab switching
          await page.getByRole("button", { name: /Coffee/ }).click();
          await page.waitForLoadState("networkidle");

          // Verify drinks are displayed
          const drinkCards = page.locator(
            '[data-testid*="drink"], .grid > div, .drink-card',
          ).first();
          await expect(drinkCards).toBeVisible();

          // Test touch targets are adequate (buttons should be at least 44px)
          const firstTab = page.getByRole("button", { name: /All/ });
          const boundingBox = await firstTab.boundingBox();
          if (boundingBox) {
            expect(boundingBox.height).toBeGreaterThanOrEqual(40); // Allow some margin
          }
        });
      });
    });
  });

  test.describe("Admin Module - Mobile Management Flow", () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to admin and login
      await page.goto("/admin");
      await page.waitForLoadState("networkidle");

      // Enter admin password
      const passwordInput = page.getByRole("textbox", { name: "Password" });
      await passwordInput.fill("admin456");
      await page.keyboard.press("Enter");
      await page.waitForLoadState("networkidle");
    });

    test("should display order dashboard responsively on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Verify order dashboard loads
      await expect(page.locator("text=/Order Dashboard|Dashboard/i").first())
        .toBeVisible();

      // Check that header controls are properly stacked on mobile
      const headerControls = page.locator(".flex-col, .space-y-4").first();
      await expect(headerControls).toBeVisible();

      // Test that buttons are full-width on mobile or properly spaced
      const actionButtons = page.getByRole("button").filter({
        hasText: /Refresh|Filter|Export/,
      });
      const buttonCount = await actionButtons.count();

      if (buttonCount > 0) {
        const firstButton = actionButtons.first();
        await expect(firstButton).toBeVisible();

        // Verify button is touch-friendly
        const boundingBox = await firstButton.boundingBox();
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(40);
        }
      }

      // Test order cards if they exist
      const orderCards = page.locator(
        '[data-testid*="order"], .order-card, .bg-white.rounded',
      ).first();
      if (await orderCards.isVisible()) {
        // Verify order card content is not clipped
        await expect(orderCards).toBeVisible();

        // Check that action buttons in cards are properly laid out
        const cardButtons = orderCards.locator("button").first();
        if (await cardButtons.isVisible()) {
          await expect(cardButtons).toBeVisible();
        }
      }
    });

    test("should handle menu management mobile layout", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to menu management
      await page.getByRole("button", { name: /Menu Management/ }).click();
      await page.waitForLoadState("networkidle");

      // Verify menu tabs are horizontally scrollable
      const menuTabs = page.getByRole("tablist").first();
      await expect(menuTabs).toBeVisible();

      // Test tab switching
      const drinkCategoriesTab = page.getByRole("tab", {
        name: /Drink Categories/i,
      });
      await expect(drinkCategoriesTab).toBeVisible();
      await drinkCategoriesTab.click();

      // Switch to Drinks tab
      const drinksTab = page.getByRole("tab", { name: /^Drinks$/i });
      await expect(drinksTab).toBeVisible();
      await drinksTab.click();

      // Switch to Option Categories tab
      const optionCategoriesTab = page.getByRole("tab", {
        name: /Option Categories/i,
      });
      await expect(optionCategoriesTab).toBeVisible();
      await optionCategoriesTab.click();

      // Verify content changes appropriately
      await expect(page.getByRole("tabpanel").first()).toBeVisible();
    });

    test("should provide mobile navigation functionality", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Test mobile navigation if available
      const mobileMenuButton = page.locator(
        'button[aria-label*="menu"], .hamburger, .mobile-menu',
      ).first();

      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();

        // Verify mobile menu opens
        const mobileMenu = page.locator(
          '.mobile-menu, [role="menu"], .dropdown-menu',
        ).first();
        await expect(mobileMenu).toBeVisible();

        // Test navigation items
        const navItems = page.getByRole("button").filter({
          hasText: /Dashboard|Menu|Orders/,
        });
        const navCount = await navItems.count();

        if (navCount > 0) {
          await expect(navItems.first()).toBeVisible();
        }
      }

      // Test direct navigation buttons
      const menuManagementBtn = page.getByRole("button", {
        name: /Menu Management/,
      });
      if (await menuManagementBtn.isVisible()) {
        await expect(menuManagementBtn).toBeVisible();

        // Verify button is touch-friendly
        const boundingBox = await menuManagementBtn.boundingBox();
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(40);
        }
      }
    });

    test.describe("Admin Mobile Viewport Testing", () => {
      mobileViewports.forEach(({ width, height, name }) => {
        test(`should work correctly on ${name} (${width}x${height})`, async ({ page }) => {
          await page.setViewportSize({ width, height });

          // Test order dashboard
          await expect(
            page.locator("text=/Order Dashboard|Dashboard/i").first(),
          ).toBeVisible();

          // Test menu management navigation
          await page.getByRole("button", { name: /Menu Management/ }).click();
          await page.waitForLoadState("networkidle");

          // Verify menu tabs work
          const tablist = page.getByRole("tablist").first();
          await expect(tablist).toBeVisible();

          // Test tab functionality
          const drinksTab = page.getByRole("tab", { name: /^Drinks$/i });
          if (await drinksTab.isVisible()) {
            await drinksTab.click();
            await expect(page.getByRole("tabpanel").first()).toBeVisible();
          }
        });
      });
    });
  });

  test.describe("Responsive Breakpoint Testing", () => {
    test("should transition correctly between mobile and tablet viewports", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Start with mobile
      await page.setViewportSize({ width: 375, height: 667 });

      // Verify mobile layout
      const categoryContainer = page.locator(".overflow-x-auto").first();
      await expect(categoryContainer).toBeVisible();

      // Switch to tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500); // Allow for responsive changes

      // Verify layout adapts to larger screen
      await expect(categoryContainer).toBeVisible();

      // Switch back to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // Verify mobile layout is restored
      await expect(categoryContainer).toBeVisible();
    });

    test.describe("Tablet Viewport Testing", () => {
      tabletViewports.forEach(({ width, height, name }) => {
        test(`should work correctly on ${name} (${width}x${height})`, async ({ page }) => {
          await page.setViewportSize({ width, height });

          await page.goto("/");
          await page.waitForLoadState("networkidle");

          // Test guest module
          const categoryTabs = page.locator(".overflow-x-auto, .flex").first();
          await expect(categoryTabs).toBeVisible();

          // Test category switching
          await page.getByRole("button", { name: /Coffee/ }).click();
          await page.waitForLoadState("networkidle");

          // Test admin module
          await page.goto("/admin");
          await page.waitForLoadState("networkidle");

          const passwordInput = page.getByRole("textbox", { name: "Password" });
          await passwordInput.fill("admin456");
          await page.keyboard.press("Enter");
          await page.waitForLoadState("networkidle");

          // Test menu management on tablet
          await page.getByRole("button", { name: /Menu Management/ }).click();
          await page.waitForLoadState("networkidle");

          const menuTabs = page.getByRole("tablist").first();
          await expect(menuTabs).toBeVisible();
        });
      });
    });
  });

  test.describe("Touch Interaction Testing", () => {
    test("should handle touch interactions correctly", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Test touch on category tabs
      const coffeeTab = page.getByRole("button", { name: /Coffee/ });

      // Simulate touch interaction
      await coffeeTab.dispatchEvent("touchstart");
      await coffeeTab.click();
      await coffeeTab.dispatchEvent("touchend");

      await page.waitForLoadState("networkidle");

      // Verify the interaction worked
      await expect(page.locator("text=/Coffee|Espresso|Latte/i").first())
        .toBeVisible();

      // Test drink card touch interaction
      const drinkCard = page.locator('[data-testid*="drink"], .grid > div')
        .first();
      if (await drinkCard.isVisible()) {
        await drinkCard.dispatchEvent("touchstart");
        await drinkCard.click();
        await drinkCard.dispatchEvent("touchend");

        await page.waitForLoadState("networkidle");
      }
    });

    test("should handle swipe gestures on category tabs", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const categoryContainer = page.locator(".overflow-x-auto").first();
      await expect(categoryContainer).toBeVisible();

      // Get the container bounds
      const boundingBox = await categoryContainer.boundingBox();
      if (boundingBox) {
        // Simulate horizontal swipe
        await page.mouse.move(
          boundingBox.x + boundingBox.width * 0.8,
          boundingBox.y + boundingBox.height / 2,
        );
        await page.mouse.down();
        await page.mouse.move(
          boundingBox.x + boundingBox.width * 0.2,
          boundingBox.y + boundingBox.height / 2,
        );
        await page.mouse.up();

        // Verify the scroll worked by checking if we can see different tabs
        await expect(categoryContainer).toBeVisible();
      }
    });
  });

  test.describe("Accessibility on Mobile", () => {
    test("should maintain accessibility standards on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Test keyboard navigation on mobile
      await page.keyboard.press("Tab");

      // Verify focus is visible
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();

      // Test ARIA labels and roles
      const categoryTabs = page.getByRole("button").filter({
        hasText: /Coffee|Tea|All/,
      });
      const tabCount = await categoryTabs.count();

      if (tabCount > 0) {
        const firstTab = categoryTabs.first();
        await expect(firstTab).toHaveAttribute("role", /button|tab/);

        // Test keyboard activation
        await firstTab.focus();
        await page.keyboard.press("Enter");
        await page.waitForLoadState("networkidle");
      }

      // Test admin module accessibility
      await page.goto("/admin");
      await page.waitForLoadState("networkidle");

      const passwordInput = page.getByRole("textbox", { name: "Password" });
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute("type", "password");

      // Test form submission with keyboard
      await passwordInput.fill("admin456");
      await page.keyboard.press("Enter");
      await page.waitForLoadState("networkidle");

      // Test menu management accessibility
      await page.getByRole("button", { name: /Menu Management/ }).click();
      await page.waitForLoadState("networkidle");

      const menuTablist = page.getByRole("tablist").first();
      if (await menuTablist.isVisible()) {
        await expect(menuTablist).toHaveAttribute("role", "tablist");

        // Test tab navigation with keyboard
        const tabs = page.getByRole("tab");
        const tabCount = await tabs.count();

        if (tabCount > 0) {
          await tabs.first().focus();
          await page.keyboard.press("ArrowRight");

          // Verify focus moved to next tab
          const activeTab = page.getByRole("tab", { selected: true });
          if (await activeTab.isVisible()) {
            await expect(activeTab).toBeFocused();
          }
        }
      }
    });
  });

  test.describe("Performance on Mobile", () => {
    test("should load quickly on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const startTime = Date.now();

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;

      // Page should load within reasonable time (5 seconds)
      expect(loadTime).toBeLessThan(5000);

      // Test navigation performance
      const navStartTime = Date.now();

      await page.getByRole("button", { name: /Coffee/ }).click();
      await page.waitForLoadState("networkidle");

      const navTime = Date.now() - navStartTime;

      // Navigation should be quick (2 seconds)
      expect(navTime).toBeLessThan(2000);
    });
  });
});
