import { test } from '@playwright/test'

test('debug admin page content', async ({ page }) => {
  await page.goto('http://localhost:5174/admin')
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/e2e/results/debug-admin-page.png', fullPage: true })
  
  // Get page content
  const content = await page.content()
  console.log('Page content length:', content.length)
  
  // Check for password input
  const passwordInput = page.locator('input[type="password"]')
  console.log('Password input visible:', await passwordInput.isVisible())
  
  if (await passwordInput.isVisible()) {
    await passwordInput.fill('admin456')
    await page.keyboard.press('Enter')
    
    // Wait a bit for the page to load
    await page.waitForTimeout(3000)
    
    // Take another screenshot
    await page.screenshot({ path: 'tests/e2e/results/debug-admin-after-login.png', fullPage: true })
    
    // Check what's on the page after login
    const buttons = await page.locator('button').allTextContents()
    console.log('All buttons:', buttons)
    
    const orderManagementButton = page.locator('button:has-text("Order Management")')
    console.log('Order Management button visible:', await orderManagementButton.isVisible())
    console.log('Order Management button count:', await orderManagementButton.count())
  }
})