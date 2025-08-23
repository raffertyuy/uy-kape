import { test, expect } from '@playwright/test'

// Extend Window interface for test utilities
declare global {
  interface Window {
    __triggerComponentError?: () => void
    __triggerRecoverableError?: () => void
  }
}

/**
 * Global Error Handling End-to-End Tests
 * 
 * These tests verify that the global error handling system works correctly
 * from the user's perspective across different error scenarios.
 */

test.describe('Global Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 })
  })

  test.describe('Network Error Handling', () => {
    test('should handle network failures gracefully', async ({ page }) => {
      // Block all network requests to simulate offline condition
      await page.route('**/*', route => route.abort())
      
      // Try to navigate to a page that requires network access
      await page.click('[data-testid="menu-link"]')
      
      // Should show network error message
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Connection Problem')).toBeVisible()
      
      // Should show retry button
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
    })

    test('should show network status indicator when offline', async ({ page }) => {
      // Simulate going offline
      await page.context().setOffline(true)
      
      // Should show offline indicator
      await expect(page.locator('[data-testid="network-status-offline"]')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=You appear to be offline')).toBeVisible()
      
      // Simulate coming back online
      await page.context().setOffline(false)
      
      // Should hide offline indicator
      await expect(page.locator('[data-testid="network-status-offline"]')).not.toBeVisible({ timeout: 5000 })
    })

    test('should retry failed network requests', async ({ page }) => {
      let requestCount = 0
      
      // Intercept requests and fail the first two, succeed on third
      await page.route('**/api/**', route => {
        requestCount++
        if (requestCount <= 2) {
          route.abort()
        } else {
          route.continue()
        }
      })
      
      // Trigger a network operation
      await page.click('[data-testid="load-data-button"]')
      
      // Should eventually succeed after retries
      await expect(page.locator('[data-testid="data-loaded"]')).toBeVisible({ timeout: 10000 })
      
      // Verify that multiple requests were made
      expect(requestCount).toBeGreaterThan(2)
    })
  })

  test.describe('Server Error Handling', () => {
    test('should handle 5xx server errors', async ({ page }) => {
      // Mock server error response
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        })
      })
      
      // Trigger an API call
      await page.click('[data-testid="api-action-button"]')
      
      // Should show server error page or message
      await expect(page.locator('[data-testid="server-error"]')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Our coffee servers are having trouble')).toBeVisible()
      
      // Should show retry option
      await expect(page.locator('[data-testid="retry-server-action"]')).toBeVisible()
    })

    test('should redirect to server error page for critical failures', async ({ page }) => {
      // Mock critical server failure
      await page.route('**/*', route => {
        if (route.request().url().includes('/api/')) {
          route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Service unavailable' })
          })
        } else {
          route.continue()
        }
      })
      
      // Navigate to a page that heavily depends on API
      await page.goto('/admin/orders')
      
      // Should redirect to or show server error page
      await expect(page.locator('[data-testid="server-error-page"]')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('text=Server Error')).toBeVisible()
    })
  })

  test.describe('Error Boundary Handling', () => {
    test('should catch and display component errors', async ({ page }) => {
      // Inject a script that will cause a component to throw an error
      await page.addInitScript(() => {
        // Mock a component that throws an error
        (window as any).__triggerComponentError = () => {
          const event = new (window as any).CustomEvent('component-error', {
            detail: { error: new Error('Test component error') }
          })
          window.dispatchEvent(event)
        }
      })
      
      // Navigate to a page with components
      await page.goto('/menu')
      
      // Trigger component error
      await page.evaluate(() => (window as any).__triggerComponentError())
      
      // Should show error boundary fallback
      await expect(page.locator('[data-testid="error-boundary-fallback"]')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Something went wrong')).toBeVisible()
      
      // Should show try again button
      await expect(page.locator('[data-testid="error-boundary-retry"]')).toBeVisible()
    })

    test('should allow recovery from component errors', async ({ page }) => {
      // Similar setup as above
      await page.addInitScript(() => {
        let shouldError = true;
        (window as any).__triggerRecoverableError = () => {
          if (shouldError) {
            shouldError = false
            throw new Error('Recoverable error')
          }
        }
      })
      
      await page.goto('/menu')
      
      // Trigger error
      await page.evaluate(() => (window as any).__triggerRecoverableError())
      
      // Should show error boundary
      await expect(page.locator('[data-testid="error-boundary-fallback"]')).toBeVisible()
      
      // Click retry
      await page.click('[data-testid="error-boundary-retry"]')
      
      // Should recover and show normal content
      await expect(page.locator('[data-testid="error-boundary-fallback"]')).not.toBeVisible()
      await expect(page.locator('[data-testid="menu-content"]')).toBeVisible()
    })
  })

  test.describe('Permission Error Handling', () => {
    test('should handle authentication errors', async ({ page }) => {
      // Mock 401 unauthorized response
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' })
        })
      })
      
      // Try to access protected content
      await page.goto('/admin')
      
      // Should show permission error
      await expect(page.locator('[data-testid="permission-error"]')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Access denied')).toBeVisible()
      
      // Should suggest logging in again
      await expect(page.locator('[data-testid="login-suggestion"]')).toBeVisible()
    })

    test('should handle forbidden access', async ({ page }) => {
      // Mock 403 forbidden response
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Forbidden' })
        })
      })
      
      // Try to access forbidden resource
      await page.click('[data-testid="restricted-action"]')
      
      // Should show access denied message
      await expect(page.locator('[data-testid="access-denied"]')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=You do not have permission')).toBeVisible()
    })
  })

  test.describe('Validation Error Handling', () => {
    test('should display form validation errors', async ({ page }) => {
      await page.goto('/guest/order')
      
      // Try to submit form with invalid data
      await page.fill('[data-testid="guest-name"]', '')
      await page.click('[data-testid="submit-order"]')
      
      // Should show validation error
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Name is required')).toBeVisible()
      
      // Should highlight invalid field
      await expect(page.locator('[data-testid="guest-name"]')).toHaveClass(/error|invalid/)
    })

    test('should clear validation errors on correction', async ({ page }) => {
      await page.goto('/guest/order')
      
      // Submit invalid form
      await page.fill('[data-testid="guest-name"]', '')
      await page.click('[data-testid="submit-order"]')
      
      // Verify error appears
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible()
      
      // Correct the error
      await page.fill('[data-testid="guest-name"]', 'John Doe')
      
      // Error should clear
      await expect(page.locator('[data-testid="validation-error"]')).not.toBeVisible()
      await expect(page.locator('[data-testid="guest-name"]')).not.toHaveClass(/error|invalid/)
    })
  })

  test.describe('Error Recovery and Persistence', () => {
    test('should persist critical errors across navigation', async ({ page }) => {
      // Mock a critical error
      await page.route('**/api/critical/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Critical system failure' })
        })
      })
      
      // Trigger critical error
      await page.click('[data-testid="critical-action"]')
      
      // Should show critical error
      await expect(page.locator('[data-testid="critical-error"]')).toBeVisible()
      
      // Navigate to different page
      await page.goto('/menu')
      
      // Critical error should persist
      await expect(page.locator('[data-testid="critical-error"]')).toBeVisible()
    })

    test('should allow manual error dismissal', async ({ page }) => {
      // Trigger a non-critical error
      await page.route('**/api/data/**', route => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Bad request' })
        })
      })
      
      await page.click('[data-testid="load-data"]')
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
      
      // Should have dismiss button
      await page.click('[data-testid="dismiss-error"]')
      
      // Error should be dismissed
      await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible()
    })
  })

  test.describe('User Experience During Errors', () => {
    test('should maintain coffee shop branding in error states', async ({ page }) => {
      // Trigger any error
      await page.route('**/*', route => route.abort())
      await page.click('[data-testid="action-button"]')
      
      // Should show error with coffee theme
      await expect(page.locator('[data-testid="error-display"]')).toBeVisible()
      await expect(page.locator('[data-testid="coffee-logo"]')).toBeVisible()
      await expect(page.locator('text=Uy, Kape!')).toBeVisible()
      
      // Should use coffee-themed error messages
      await expect(page.locator('text=coffee servers')).toBeVisible()
    })

    test('should provide helpful error recovery suggestions', async ({ page }) => {
      // Mock different types of errors and verify appropriate suggestions
      const errorScenarios = [
        {
          status: 500,
          expectedSuggestion: 'try again in a moment'
        },
        {
          status: 401,
          expectedSuggestion: 'log in again'
        },
        {
          status: 400,
          expectedSuggestion: 'check your input'
        }
      ]
      
      for (const scenario of errorScenarios) {
        await page.route('**/api/test/**', route => {
          route.fulfill({
            status: scenario.status,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Test error' })
          })
        })
        
        await page.click('[data-testid="test-action"]')
        
        await expect(page.locator(`text=${scenario.expectedSuggestion}`)).toBeVisible()
        
        // Clear the error for next iteration
        await page.click('[data-testid="clear-errors"]')
      }
    })
  })
})