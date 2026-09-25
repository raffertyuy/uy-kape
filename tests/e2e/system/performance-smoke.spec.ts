import { expect, test } from "@playwright/test";

test.describe("Performance Optimization Smoke Tests", () => {
  test("lazy-loaded routes render correctly", async ({ page }) => {
    // Welcome page (eager) loads
    await page.goto("/");
    await expect(page).toHaveTitle(/Uy, Kape!/);
    await expect(page.locator("h1")).toContainText("Uy, Kape!");

    // Guest module (lazy) loads
    await page.goto("/order");
    await expect(page.locator("h2")).toContainText("Order Your Coffee");

    // Admin module (lazy) loads
    await page.goto("/admin");
    const passwordInput = page.locator('input[type="password"]');
    const adminContent = page.locator('[data-testid="order-dashboard"]');
    await expect(passwordInput.or(adminContent)).toBeVisible();

    // Navigate back to welcome — should still render
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Uy, Kape!");
  });

  test("guest ordering page loads drink categories", async ({ page }) => {
    await page.goto("/order");

    // Category tabs should be present (data from Supabase loads)
    await expect(page.getByRole("tab", { name: /all drinks/i })).toBeVisible();

    // At least one drink card should appear
    await expect(page.locator("h4").first()).toBeVisible();
  });

  test("not-found route renders via lazy loading", async ({ page }) => {
    await page.goto("/nonexistent-page");

    // The NotFound page should render (lazy-loaded)
    await expect(page.locator("body")).toContainText(/not found|404|page/i);
  });
});
