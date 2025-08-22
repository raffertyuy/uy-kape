import { test, expect } from '@playwright/test';

test.describe('Menu Management CRUD Operations', () => {
  test('Test Add New Drink Category', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Click Barista Admin Module
    await page.click('button:has-text("Barista Admin Module")');
    
    // Enter password (assuming it's the hardcoded password from PasswordProtection)
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Enter")');
    
    // Wait for admin dashboard to load
    await page.waitForSelector('text=Menu Management');
    
    // Click Menu Management
    await page.click('button:has-text("Menu Management")');
    
    // Wait for menu management page to load
    await page.waitForSelector('text=Drink Categories');
    
    // Ensure we're on the Drink Categories tab
    await page.click('button:has-text("Drink Categories")');
    
    // Click Add New Category button
    await page.click('button:has-text("Add New Category")');
    
    // Wait for the modal/form to appear
    await page.waitForSelector('input[placeholder*="category name"], input[placeholder*="Category name"]');
    
    // Fill in the form
    const testCategoryName = `Test Category ${Date.now()}`;
    await page.fill('input[placeholder*="category name"], input[placeholder*="Category name"]', testCategoryName);
    await page.fill('textarea[placeholder*="description"], input[placeholder*="description"]', 'Test category description');
    
    // Submit the form
    await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    
    // Wait for success message or category to appear in the list
    await page.waitForTimeout(2000);
    
    // Verify the category was added successfully
    await expect(page.locator(`text=${testCategoryName}`)).toBeVisible();
    
    console.log('✅ Successfully added new drink category:', testCategoryName);
  });

  test('Test Add New Drink', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Click Barista Admin Module
    await page.click('button:has-text("Barista Admin Module")');
    
    // Enter password
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Enter")');
    
    // Wait for admin dashboard to load
    await page.waitForSelector('text=Menu Management');
    
    // Click Menu Management
    await page.click('button:has-text("Menu Management")');
    
    // Wait for menu management page to load
    await page.waitForSelector('text=Drinks');
    
    // Click on Drinks tab
    await page.click('button:has-text("Drinks")');
    
    // Click Add New Drink button
    await page.click('button:has-text("Add New Drink")');
    
    // Wait for the modal/form to appear
    await page.waitForSelector('input[placeholder*="drink name"], input[placeholder*="Drink name"]');
    
    // Fill in the form
    const testDrinkName = `Test Drink ${Date.now()}`;
    await page.fill('input[placeholder*="drink name"], input[placeholder*="Drink name"]', testDrinkName);
    await page.fill('textarea[placeholder*="description"], input[placeholder*="description"]', 'Test drink description');
    
    // Select a category (first option in dropdown)
    const categorySelect = page.locator('select[name*="category"], select[id*="category"]');
    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption({ index: 1 }); // Skip first empty option
    }
    
    // Submit the form
    await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    
    // Wait for success message or drink to appear in the list
    await page.waitForTimeout(2000);
    
    // Verify the drink was added successfully
    await expect(page.locator(`text=${testDrinkName}`)).toBeVisible();
    
    console.log('✅ Successfully added new drink:', testDrinkName);
  });

  test('Test Add New Option Category', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Click Barista Admin Module
    await page.click('button:has-text("Barista Admin Module")');
    
    // Enter password
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Enter")');
    
    // Wait for admin dashboard to load
    await page.waitForSelector('text=Menu Management');
    
    // Click Menu Management
    await page.click('button:has-text("Menu Management")');
    
    // Wait for menu management page to load
    await page.waitForSelector('text=Options');
    
    // Click on Options tab
    await page.click('button:has-text("Options")');
    
    // Click Add New Option Category button
    await page.click('button:has-text("Add New Option Category")');
    
    // Wait for the modal/form to appear
    await page.waitForSelector('input[placeholder*="option"], input[placeholder*="Option"]');
    
    // Fill in the form
    const testOptionName = `Test Option ${Date.now()}`;
    await page.fill('input[placeholder*="option"], input[placeholder*="Option"]', testOptionName);
    await page.fill('textarea[placeholder*="description"], input[placeholder*="description"]', 'Test option description');
    
    // Submit the form
    await page.click('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    
    // Wait for success message or option to appear in the list
    await page.waitForTimeout(2000);
    
    // Verify the option category was added successfully
    await expect(page.locator(`text=${testOptionName}`)).toBeVisible();
    
    console.log('✅ Successfully added new option category:', testOptionName);
  });
});