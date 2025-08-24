import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:5173";
const ADMIN_PASSWORD = "admin456";

test.describe("Barista Module Refresh Behavior - Core Tests", () => {
  
  test("Menu Management view persists after F5 refresh", async ({ page }) => {
    // Navigate to admin and authenticate
    await page.goto(`${BASE_URL}/admin`);
    await page.getByRole("textbox", { name: "Password" }).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Access" }).click();
    
    // Wait for dashboard to load
    await expect(page.getByRole("heading", { name: "Barista Administration Dashboard" })).toBeVisible();
    
    // Navigate to Menu Management
    await page.getByRole("button", { name: /Menu Management/ }).click();
    await expect(page.getByRole("heading", { name: "Menu Management" })).toBeVisible();
    
    // Verify URL contains view=menu
    expect(page.url()).toContain("view=menu");
    
    // Refresh using F5
    await page.keyboard.press("F5");
    
    // Verify still in Menu Management (session should be preserved)
    await expect(page.getByRole("heading", { name: "Menu Management" })).toBeVisible({ timeout: 10000 });
    expect(page.url()).toContain("view=menu");
  });

  test("Order Dashboard view persists after browser reload", async ({ page }) => {
    // Navigate to admin and authenticate  
    await page.goto(`${BASE_URL}/admin`);
    await page.getByRole("textbox", { name: "Password" }).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Access" }).click();
    
    // Wait for dashboard to load
    await expect(page.getByRole("heading", { name: "Barista Administration Dashboard" })).toBeVisible();
    
    // Navigate to Order Dashboard
    await page.getByRole("button", { name: /Order Management/ }).click();
    await expect(page.getByRole("heading", { name: "Order Dashboard" })).toBeVisible();
    
    // Verify URL contains view=orders
    expect(page.url()).toContain("view=orders");
    
    // Refresh using page.reload()
    await page.reload();
    
    // Verify still in Order Dashboard (session should be preserved)
    await expect(page.getByRole("heading", { name: "Order Dashboard" })).toBeVisible({ timeout: 10000 });
    expect(page.url()).toContain("view=orders");
  });

  test("Direct URL access to Menu Management works", async ({ page }) => {
    // Navigate directly to Menu Management URL
    await page.goto(`${BASE_URL}/admin?view=menu`);
    
    // Authenticate
    await page.getByRole("textbox", { name: "Password" }).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Access" }).click();
    
    // Verify Menu Management loads
    await expect(page.getByRole("heading", { name: "Menu Management" })).toBeVisible();
    expect(page.url()).toContain("view=menu");
  });

  test("Direct URL access to Order Dashboard works", async ({ page }) => {
    // Navigate directly to Order Dashboard URL
    await page.goto(`${BASE_URL}/admin?view=orders`);
    
    // Authenticate
    await page.getByRole("textbox", { name: "Password" }).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Access" }).click();
    
    // Verify Order Dashboard loads
    await expect(page.getByRole("heading", { name: "Order Dashboard" })).toBeVisible();
    expect(page.url()).toContain("view=orders");
  });

  test("Invalid view parameter defaults to dashboard", async ({ page }) => {
    // Navigate to URL with invalid view parameter
    await page.goto(`${BASE_URL}/admin?view=invalid`);
    
    // Authenticate
    await page.getByRole("textbox", { name: "Password" }).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Access" }).click();
    
    // Should default to dashboard
    await expect(page.getByRole("heading", { name: "Barista Administration Dashboard" })).toBeVisible();
  });
});