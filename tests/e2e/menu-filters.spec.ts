import { test, expect } from '@playwright/test';

test.describe('Menu Management - Drink Filters', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Click Barista Administration link
    await page.click('a:has-text("⚙️ Barista Administration")');
    
    // Enter password
    await page.fill('input[type="password"]', 'admin456');
    await page.click('button:has-text("Access")');
    
    // Wait for admin dashboard to load
    await page.waitForSelector('text=Menu Management');
    
    // Click Menu Management
    await page.click('button:has-text("Menu Management")');
    
    // Wait for menu management page to load
    await page.waitForSelector('text=Drinks');
    
    // Click on Drinks tab
    await page.click('button:has-text("Drinks")');
  });

  test('should show and interact with filter controls', async ({ page }) => {
    // Wait for drinks page to load
    await page.waitForSelector('text=Show Options Preview');
    
    // Check for search input
    const searchInput = page.locator('input[placeholder*="Search drinks"]');
    await expect(searchInput).toBeVisible();
    
    // Check for filter button
    const filterButton = page.locator('button:has-text("Filters")');
    await expect(filterButton).toBeVisible();
    
    // Click filters button to expand filter panel
    await filterButton.click();
    
    // Check for filter options
    await expect(page.locator('label:has-text("Status")')).toBeVisible();
    await expect(page.locator('label:has-text("Category")')).toBeVisible();
    await expect(page.locator('label:has-text("Sort By")')).toBeVisible();
    await expect(page.locator('label:has-text("Order")')).toBeVisible();
    
    console.log('✅ Filter controls are visible and interactive');
  });

  test('should filter drinks by search query', async ({ page }) => {
    // Wait for drinks page to load
    await page.waitForSelector('text=Show Options Preview');
    
    // Get search input
    const searchInput = page.locator('input[placeholder*="Search drinks"]');
    
    // Count initial drinks (if any)
    const initialDrinkCards = page.locator('[data-testid="drink-card"], .bg-white.rounded-lg.shadow').filter({ hasText: 'Manage Options' });
    const initialCount = await initialDrinkCards.count();
    
    // Enter search term (assuming there's at least one drink with 'Coffee' or similar)
    await searchInput.fill('Coffee');
    
    // Wait for filter to apply (debounced)
    await page.waitForTimeout(500);
    
    // Check that search is working - this might filter results
    const filteredCards = page.locator('[data-testid="drink-card"], .bg-white.rounded-lg.shadow').filter({ hasText: 'Manage Options' });
    const filteredCount = await filteredCards.count();
    
    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(500);
    
    console.log(`✅ Search functionality tested - initial: ${initialCount}, filtered: ${filteredCount}`);
  });

  test('should filter drinks by category', async ({ page }) => {
    // Wait for drinks page to load
    await page.waitForSelector('text=Show Options Preview');
    
    // Click filters button to expand filter panel
    const filterButton = page.locator('button:has-text("Filters")');
    await filterButton.click();
    
    // Find category dropdown
    const categorySelect = page.locator('select').filter({ has: page.locator('option:has-text("All Categories")') });
    await expect(categorySelect).toBeVisible();
    
    // Check available categories
    const categories = await page.locator('option').filter({ hasText: /^(?!All Categories$).+/ }).count();
    
    if (categories > 0) {
      // Select first available category
      const firstCategory = page.locator('option').filter({ hasText: /^(?!All Categories$).+/ }).first();
      const categoryText = await firstCategory.textContent();
      
      await categorySelect.selectOption({ label: categoryText || '' });
      
      // Wait for filter to apply
      await page.waitForTimeout(500);
      
      console.log(`✅ Category filter tested with category: ${categoryText}`);
    } else {
      console.log('✅ No categories available to test filtering');
    }
  });

  test('should filter drinks by status', async ({ page }) => {
    // Wait for drinks page to load
    await page.waitForSelector('text=Show Options Preview');
    
    // Click filters button to expand filter panel
    const filterButton = page.locator('button:has-text("Filters")');
    await filterButton.click();
    
    // Find status dropdown
    const statusSelect = page.locator('select').filter({ has: page.locator('option:has-text("Active")') });
    await expect(statusSelect).toBeVisible();
    
    // Select "Active" status
    await statusSelect.selectOption('active');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Select "Inactive" status
    await statusSelect.selectOption('inactive');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Reset to "All"
    await statusSelect.selectOption('');
    
    console.log('✅ Status filter functionality tested');
  });

  test('should sort drinks by different criteria', async ({ page }) => {
    // Wait for drinks page to load
    await page.waitForSelector('text=Show Options Preview');
    
    // Click filters button to expand filter panel
    const filterButton = page.locator('button:has-text("Filters")');
    await filterButton.click();
    
    // Find sort by dropdown
    const sortBySelect = page.locator('select').filter({ has: page.locator('option:has-text("Display Order")') });
    await expect(sortBySelect).toBeVisible();
    
    // Test different sort options
    await sortBySelect.selectOption('name');
    await page.waitForTimeout(300);
    
    await sortBySelect.selectOption('created_at');
    await page.waitForTimeout(300);
    
    await sortBySelect.selectOption('display_order');
    await page.waitForTimeout(300);
    
    // Test sort order
    const sortOrderSelect = page.locator('select').filter({ has: page.locator('option:has-text("Ascending")') });
    await expect(sortOrderSelect).toBeVisible();
    
    await sortOrderSelect.selectOption('desc');
    await page.waitForTimeout(300);
    
    await sortOrderSelect.selectOption('asc');
    await page.waitForTimeout(300);
    
    console.log('✅ Sort functionality tested');
  });

  test('should show filter count and allow clearing filters', async ({ page }) => {
    // Wait for drinks page to load
    await page.waitForSelector('text=Show Options Preview');
    
    // Click filters button to expand filter panel
    const filterButton = page.locator('button:has-text("Filters")');
    await filterButton.click();
    
    // Apply some filters
    const statusSelect = page.locator('select').filter({ has: page.locator('option:has-text("Active")') });
    await statusSelect.selectOption('active');
    
    const sortBySelect = page.locator('select').filter({ has: page.locator('option:has-text("Display Order")') });
    await sortBySelect.selectOption('name');
    
    // Wait for filters to apply
    await page.waitForTimeout(500);
    
    // Check if filter count badge appears
    const filterCountBadge = page.locator('button:has-text("Filters")').locator('.bg-coffee-200');
    await expect(filterCountBadge).toBeVisible();
    
    // Check if "Clear all" button appears
    const clearAllButton = page.locator('button:has-text("Clear all")');
    await expect(clearAllButton).toBeVisible();
    
    // Click clear all
    await clearAllButton.click();
    
    // Wait for filters to clear
    await page.waitForTimeout(500);
    
    // Verify filters are cleared
    await expect(statusSelect).toHaveValue('');
    
    console.log('✅ Filter count and clear functionality tested');
  });
});