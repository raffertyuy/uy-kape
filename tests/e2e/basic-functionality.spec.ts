import { test, expect } from '@playwright/test'

test.describe('Basic Site Functionality', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Check if the page loads
    await expect(page).toHaveTitle(/Uy, Kape!/)
    
    // Check for basic content
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to admin page', async ({ page }) => {
    await page.goto('http://localhost:5173/admin')
    
    // Should either show the admin dashboard or password prompt
    const passwordInput = page.locator('input[type="password"]')
    const adminContent = page.locator('[data-testid="order-dashboard"]')
    
    // One of these should be visible
    await expect(passwordInput.or(adminContent)).toBeVisible()
  })
})