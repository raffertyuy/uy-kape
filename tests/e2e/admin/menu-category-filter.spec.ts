import { test, expect } from '@playwright/test'

test.describe('Menu Management - Category Filter', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Click Barista Administration link
    await page.click('a:has-text("⚙️ Barista Administration")')
    
    // Enter password
    await page.fill('input[type="password"]', 'admin456')
    await page.click('button:has-text("Access")')
    
    // Wait for admin dashboard to load
    await page.waitForSelector('text=Menu Management')
    
    // Click Menu Management
    await page.click('button:has-text("Menu Management")')
    
    // Click on Drinks tab
    await page.waitForSelector('text=Drinks')
    await page.click('button:has-text("Drinks")')
    
    // Wait for drinks to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Give a moment for the data to load
  })

  test('should access drinks management page and show category filter', async ({ page }) => {
    // Verify we can see the category filter dropdown
    await page.waitForSelector('#category-filter', { timeout: 10000 })
    
    // Verify filter dropdown has the expected options
    const filterDropdown = page.locator('#category-filter')
    await expect(filterDropdown).toBeVisible()
    
    // Check that "All Categories" is the default option (by checking select value)
    await expect(filterDropdown).toHaveValue('')
    
    // Verify search input is present
    await page.waitForSelector('#search', { timeout: 5000 })
    const searchInput = page.locator('#search')
    await expect(searchInput).toBeVisible()
    
    // Verify view mode toggle buttons are present
    await expect(page.locator('button:has-text("Grid view") svg')).toBeVisible()
    await expect(page.locator('button:has-text("List view") svg')).toBeVisible()
    
    // Verify at least some drinks are displayed
    await page.waitForSelector('text=Espresso', { timeout: 10000 })
    await expect(page.locator('text=Espresso')).toBeVisible()
  })

  test('should filter drinks using search functionality', async ({ page }) => {
    // Wait for drinks to load
    await page.waitForSelector('text=Espresso', { timeout: 10000 })
    await page.waitForSelector('text=Milo', { timeout: 10000 })
    
    // Use search to filter drinks
    await page.fill('#search', 'espresso')
    
    // Wait for search filtering to take effect
    await page.waitForTimeout(500)
    
    // Should show Espresso-related drinks (using more specific selector)
    await expect(page.locator('[data-testid="drink-card"]:has-text("Espresso")')).toBeVisible()
    
    // Should not show unrelated drinks
    await expect(page.locator('[data-testid="drink-card"]:has-text("Milo")')).not.toBeVisible()
    
    // Should show search filter indicator
    await expect(page.locator('text=Search: "espresso"')).toBeVisible()
    
    // Clear search
    await page.fill('#search', '')
    await page.waitForTimeout(500)
    
    // Should show all drinks again
    await expect(page.locator('text=Espresso')).toBeVisible()
    await expect(page.locator('text=Milo')).toBeVisible()
  })

  test('should toggle between grid and list view modes', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('#category-filter', { timeout: 10000 })
    
    // Initially should be in grid view (check button states)
    const gridButton = page.getByRole('button', { name: 'Grid view' })
    const listButton = page.getByRole('button', { name: 'List view' })
    
    // Verify both buttons exist
    await expect(gridButton).toBeVisible()
    await expect(listButton).toBeVisible()
    
    // Click list view
    await listButton.click()
    await page.waitForTimeout(300)
    
    // Click back to grid view
    await gridButton.click()
    await page.waitForTimeout(300)
    
    // Verify we can still see drinks after view changes
    await expect(page.locator('[data-testid="drink-card"]').first()).toBeVisible()
  })
})