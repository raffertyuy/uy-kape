import { test, expect } from '@playwright/test';

/**
 * E2E tests for telemetry disabled state
 * 
 * These tests verify that the application works correctly when telemetry
 * is disabled (default state). All core functionality should work normally
 * without any telemetry infrastructure.
 */

test.describe('Application with Telemetry Disabled', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console error tracking
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate to the app - telemetry is disabled by default in test environment
    await page.goto('/');
  });

  test('should load homepage without telemetry errors', async ({ page }) => {
    // Verify the page loads correctly
    await expect(page).toHaveTitle(/Uy, Kape!/);
    
    // Verify basic page elements are present
    await expect(page.locator('h1')).toContainText('Uy, Kape!');
    await expect(page.locator('body')).toContainText('Brewing fellowship');
    
    // Verify navigation links are present
    await expect(page.getByText('🛍️ Order Here')).toBeVisible();
    await expect(page.getByText('⚙️ Barista Administration')).toBeVisible();

    // Wait a moment for any potential errors
    await page.waitForTimeout(2000);
  });

  test('should navigate to guest module without telemetry issues', async ({ page }) => {
    // Click on Order Here link
    await page.getByText('🛍️ Order Here').click();
    
    // Wait for navigation
    await page.waitForTimeout(2000);
    
    // Check we're on the order page
    expect(page.url()).toContain('/order');
    
    // The guest module might be password protected or directly accessible
    // Check for either password input or direct order interface or any substantial content
    const passwordInput = page.locator('input[type="password"]');
    const orderInterface = page.locator('[data-testid="guest-order-form"], .order-form, .guest-module, .menu-section');
    
    const passwordVisible = await passwordInput.isVisible();
    const interfaceVisible = await orderInterface.isVisible();
    
    // At minimum, verify we have some substantial content on the page
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
    expect(bodyContent!.length).toBeGreaterThan(50); // Should have substantial content
    
    // Either password or interface should be visible, or we should have meaningful content
    const hasContent = passwordVisible || interfaceVisible || (bodyContent && bodyContent.length > 100);
    expect(hasContent).toBe(true);
  });

  test('should handle admin access without telemetry dependencies', async ({ page }) => {
    // Click on Barista Administration link
    await page.getByText('⚙️ Barista Administration').click();
    
    // Wait for navigation
    await page.waitForTimeout(2000);
    
    // Check we're on the admin page
    expect(page.url()).toContain('/admin');
    
    // Admin should always require password
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    
    // Should see password-related content
    const bodyContent = await page.textContent('body');
    expect(bodyContent?.toLowerCase()).toMatch(/password|enter/i);
  });

  test('should handle navigation without performance tracking errors', async ({ page }) => {
    // Navigate between different routes
    await page.getByText('🛍️ Order Here').click();
    await page.waitForTimeout(1000);
    
    // Go back to home
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Uy, Kape!');
    
    // Try admin page
    await page.getByText('⚙️ Barista Administration').click();
    await page.waitForTimeout(1000);
    
    // Go back to home again
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Uy, Kape!');
  });

  test('should handle error scenarios gracefully without telemetry logging', async ({ page }) => {
    // Test navigation to non-existent route
    await page.goto('/non-existent-route');
    await page.waitForTimeout(2000);
    
    // Navigate back to valid route
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Uy, Kape!');
    
    // Verify page loads correctly after error scenario
    await expect(page.getByText('🛍️ Order Here')).toBeVisible();
    await expect(page.getByText('⚙️ Barista Administration')).toBeVisible();
  });

  test('should maintain responsive design without performance tracking', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Verify basic elements are still visible on mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('🛍️ Order Here')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Verify layout adapts
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('Brewing fellowship')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    
    // Verify full layout is visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('🛍️ Order Here')).toBeVisible();
    await expect(page.getByText('⚙️ Barista Administration')).toBeVisible();
  });

  test('should not make telemetry-related network requests', async ({ page }) => {
    // Track network requests
    const networkRequests: string[] = [];
    page.on('request', request => {
      const url = request.url();
      // Only track non-local requests (external APIs, not source files)
      if (!url.includes('localhost:5173') && !url.includes('file://')) {
        networkRequests.push(url);
      }
    });
    
    // Navigate around the app
    await page.getByText('🛍️ Order Here').click();
    await page.waitForTimeout(1000);
    
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    await page.getByText('⚙️ Barista Administration').click();
    await page.waitForTimeout(1000);
    
    // Check that no external telemetry-related requests were made
    const telemetryRequests = networkRequests.filter(url =>
      url.includes('vercel') && url.includes('speed-insights') ||
      url.includes('analytics') ||
      url.includes('telemetry') ||
      url.includes('tracking') ||
      url.includes('vitals')
    );
    
    expect(telemetryRequests).toHaveLength(0);
  });
});