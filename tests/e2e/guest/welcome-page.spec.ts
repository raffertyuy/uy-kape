import { expect, test } from '@playwright/test'

test.describe('Welcome Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the logo image', async ({ page }) => {
    const logo = page.getByRole('img', { name: 'Uy, Kape! Logo' })
    await expect(logo).toBeVisible()

    // Verify the image actually loaded (not broken)
    const naturalWidth = await logo.evaluate(
      // eslint-disable-next-line no-undef
      (img) => (img as HTMLImageElement).naturalWidth
    )
    expect(naturalWidth).toBeGreaterThan(0)
  })

  test('should not display tech-stack description section', async ({ page }) => {
    // The description and tech badges should not be present
    await expect(
      page.getByText('A simple, password-protected coffee ordering system')
    ).not.toBeVisible()
    await expect(page.getByText('React + TypeScript')).not.toBeVisible()
    await expect(page.getByText('Tailwind CSS')).not.toBeVisible()
    await expect(page.getByText('Supabase')).not.toBeVisible()
  })

  test('should display navigation buttons', async ({ page }) => {
    const orderLink = page.getByRole('link', { name: /order here/i })
    const adminLink = page.getByRole('link', { name: /barista administration/i })

    await expect(orderLink).toBeVisible()
    await expect(adminLink).toBeVisible()
  })
})
