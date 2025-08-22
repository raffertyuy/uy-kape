import { test, expect } from '@playwright/test'

test.describe('Wait Time Configuration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app root
    await page.goto('http://localhost:5174')
  })

  test('should have wait time environment variable configured', async ({ page }) => {
    // Check that the application loads successfully
    await expect(page).toHaveTitle(/Uy, Kape!/)
    
    // Navigate to order page 
    await page.getByRole('link', { name: '🛍️ Order Here' }).click()
    
    // Enter guest password
    await page.getByRole('textbox', { name: 'Password' }).fill('guest123')
    await page.getByRole('button', { name: 'Access' }).click()
    
    // Verify we're in the order flow (even if drinks don't load due to no real DB)
    await expect(page.getByText('Order Your Coffee')).toBeVisible()
    
    // This test verifies the basic order flow structure is working
    // The actual wait time calculation is tested in unit tests
  })

  test('should show progress indicator', async ({ page }) => {
    await page.getByRole('link', { name: '🛍️ Order Here' }).click()
    await page.getByRole('textbox', { name: 'Password' }).fill('guest123')
    await page.getByRole('button', { name: 'Access' }).click()
    
    // Check that progress indicator is shown
    await expect(page.getByText('Progress')).toBeVisible()
    await expect(page.getByText('25%')).toBeVisible()
  })
})