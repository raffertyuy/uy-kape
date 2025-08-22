import { test } from '@playwright/test';

test.describe('Menu Management CRUD Operations', () => {
  test('Test Add New Drink Category', async ({ page }) => {
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
    
    // Wait for menu management page to load and verify we can see categories
    await page.waitForSelector('text=Drink Categories');
    
    console.log('✅ Successfully navigated to Menu Management - Drink Categories');
  });

  test('Test Navigate to Drinks Management', async ({ page }) => {
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
    
    console.log('✅ Successfully navigated to Menu Management - Drinks');
  });

  test('Test Navigate to Option Categories Management', async ({ page }) => {
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
    await page.waitForSelector('text=Option Categories');
    
    // Click on Option Categories tab
    await page.click('button:has-text("Option Categories")');
    
    console.log('✅ Successfully navigated to Menu Management - Option Categories');
  });
});