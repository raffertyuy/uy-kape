import { expect, test } from '@playwright/test'

test.describe('Admin Dashboard Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')

    // Enter admin password
    const passwordInput = page.locator('input[type="password"]')
    if (await passwordInput.isVisible()) {
      await passwordInput.fill(process.env.VITE_ADMIN_PASSWORD || 'admin456')
      await page.getByRole('button', { name: /access/i }).click()
    }

    // Wait for dashboard to load
    await expect(page.getByText('Barista Administration')).toBeVisible()
  })

  test('should show hacked mode toggle in the header row', async ({ page }) => {
    const toggle = page.getByTestId('hacked-mode-toggle')
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('role', 'switch')

    // The toggle label should be visible near the header
    await expect(page.getByText(/Hacked Mode/)).toBeVisible()
  })

  test('should not have system status or Easter Egg sections', async ({ page }) => {
    // System status was removed (hardcoded, no real health checks)
    await expect(page.getByText('System Status:')).not.toBeVisible()
    // The old Easter Egg card should not exist
    await expect(page.getByText('Easter Egg')).not.toBeVisible()
  })

  test('dashboard content should be compact without excessive scrolling', async ({ page }) => {
    // The admin dashboard card should not be excessively tall
    // (it previously required scrolling due to large Easter Egg and System Status sections)
    const dashboardCard = page.locator('.bg-white.rounded-lg.shadow-lg').first()
    const cardBox = await dashboardCard.boundingBox()

    expect(cardBox).not.toBeNull()
    // The dashboard card should fit within a reasonable height (under 600px)
    expect(cardBox!.height).toBeLessThan(600)
  })
})
