import { expect, type Page, test } from "@playwright/test";

/**
 * E2E Tests for Hacked Mode Easter Egg
 *
 * Validates the toggle behavior, full-site theme change, copy changes in the
 * guest flow, and that admin views are unaffected by drink name prefixes.
 */

const ADMIN_PASSWORD = "admin456";
const GUEST_PASSWORD = "guest123";

/** Helper: log in to admin, returns to admin dashboard */
async function loginToAdmin(page: Page) {
  await page.goto("/admin");
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill(ADMIN_PASSWORD);
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("hacked-mode-toggle")).toBeVisible({
    timeout: 5000,
  });
}

/** Helper: clear hacked mode from localStorage so each test starts clean */
async function clearHackedMode(page: Page) {
  await page.evaluate(() => localStorage.removeItem("uy-kape-hacked-mode"));
  // Remove the CSS class too
  await page.evaluate(() =>
    document.documentElement.classList.remove("hacked-mode")
  );
}

/** Helper: reset hacked mode in DB and localStorage via the toggle (if currently ON, click to turn OFF) */
async function ensureHackedModeOff(page: Page) {
  await page.goto("/admin");
  const passwordInput = page.locator('input[type="password"]');
  if (await passwordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await passwordInput.fill(ADMIN_PASSWORD);
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("hacked-mode-toggle")).toBeVisible({
      timeout: 5000,
    });
  }
  const toggle = page.getByTestId("hacked-mode-toggle");
  await expect(toggle).toBeVisible({ timeout: 5000 });
  const isOn = (await toggle.getAttribute("aria-checked")) === "true";
  if (isOn) {
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false", {
      timeout: 5000,
    });
  }
}

test.describe("Hacked Mode — DB Persistence", () => {
  test.beforeEach(async ({ page }) => {
    await ensureHackedModeOff(page);
  });

  test.afterEach(async ({ page }) => {
    await ensureHackedModeOff(page);
  });

  test("toggle ON persists to DB — state survives page refresh", async ({ page }) => {
    await loginToAdmin(page);

    const toggle = page.getByTestId("hacked-mode-toggle");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");

    // Full page reload — DB value should be read on mount
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Toggle should still be checked after reload (DB returned true)
    await expect(page.getByTestId("hacked-mode-toggle")).toHaveAttribute(
      "aria-checked",
      "true",
      { timeout: 5000 },
    );
  });

  test("blur on empty name field regenerates a hacker name when hacked mode is on", async ({ page }) => {
    // beforeEach already navigated to /admin and ensured hacked mode is off
    // The toggle should already be visible (we're logged in)
    const toggle = page.getByTestId("hacked-mode-toggle");
    await expect(toggle).toBeVisible({ timeout: 5000 });

    // Enable hacked mode via admin toggle (persists to DB)
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");

    // Navigate to guest order page
    await page.goto("/order");
    await page.waitForLoadState("networkidle");

    // Handle potential guest password protection
    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passwordInput.fill(GUEST_PASSWORD);
      await page.keyboard.press("Enter");
      await page.waitForLoadState("networkidle");
    }

    // Select the first drink
    const firstDrink = page.locator('[data-testid^="drink-card-"]').first();
    await firstDrink.click();

    // Advance through options to the name step
    const continueBtn = page.getByRole("button", { name: /Continue/i });
    await expect(continueBtn).toBeVisible({ timeout: 5000 });
    await continueBtn.click();

    // Should now be on the "Your Information" step with a generated name
    const nameInput = page.getByRole("textbox", { name: /Your Name/i });
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Wait for the auto-generated name to be populated (happens via useEffect)
    await expect(nameInput).not.toHaveValue("", { timeout: 5000 });

    // Click the name field to clear the generated name
    await nameInput.click();
    await expect(nameInput).toHaveValue("");

    // Tab away to trigger blur (should regenerate a hacker name)
    await page.keyboard.press("Tab");

    // The regenerated name should be a hacker-themed name (adjective + noun)
    const hackerTerms =
      /\b(Shadow|Phantom|Ghost|Null|Void|Cipher|Binary|Toxic|Rogue|Stealth|Poisonous|Corrupted|Crashed|Infected|Malicious|Broken|Hacker|Byte|Exploit|Daemon|Bot|Script|Overflow|Cache|Loop|Stack|Register|Bit|Kernel|Rootkit|Payload|Glitch)\b/;
    const regeneratedName = await nameInput.inputValue();
    expect(regeneratedName.length).toBeGreaterThan(0);
    expect(hackerTerms.test(regeneratedName)).toBe(true);
  });

  test("toggle OFF persists to DB — deactivated state survives page refresh", async ({ page }) => {
    await loginToAdmin(page);

    // First turn ON
    const toggle = page.getByTestId("hacked-mode-toggle");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");

    // Then turn OFF
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");

    // Full page reload
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Toggle should still be unchecked (DB returned false)
    await expect(page.getByTestId("hacked-mode-toggle")).toHaveAttribute(
      "aria-checked",
      "false",
      { timeout: 5000 },
    );
  });
});

test.describe("Hacked Mode Easter Egg", () => {
  test.beforeEach(async ({ page }) => {
    // Start each test with hacked mode off
    await page.goto("/");
    await clearHackedMode(page);
  });

  test.afterEach(async ({ page }) => {
    // Leave state clean for next test
    await clearHackedMode(page);
  });

  test("Easter Egg toggle is visible on admin dashboard", async ({ page }) => {
    await loginToAdmin(page);

    const toggle = page.getByTestId("hacked-mode-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("role", "switch");
    await expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  test("toggling ON activates hacked mode and shows warning toast", async ({ page }) => {
    await loginToAdmin(page);

    const toggle = page.getByTestId("hacked-mode-toggle");
    await expect(toggle).toHaveAttribute("aria-checked", "false");

    await toggle.click();

    // Toggle should now be checked
    await expect(toggle).toHaveAttribute("aria-checked", "true");

    // Warning toast should appear
    const toast = page.locator('[role="status"], [aria-live]').filter({
      hasText: /SYSTEM COMPROMISED|Hacked Mode activated/i,
    });
    await expect(toast).toBeVisible({ timeout: 3000 });
  });

  test("toggling OFF restores normal mode and shows info toast", async ({ page }) => {
    await loginToAdmin(page);

    const toggle = page.getByTestId("hacked-mode-toggle");

    // Turn on
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");

    // Turn off
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");

    // Info toast should appear
    const toast = page.locator('[role="status"], [aria-live]').filter({
      hasText: /System Restored|Hacked Mode deactivated/i,
    });
    await expect(toast).toBeVisible({ timeout: 3000 });
  });

  test("hacked mode theme persists across page navigation", async ({ page }) => {
    await loginToAdmin(page);

    // Enable hacked mode
    await page.getByTestId("hacked-mode-toggle").click();

    // Navigate away and confirm localStorage persists
    await page.goto("/");
    const isHacked = await page.evaluate(
      () => localStorage.getItem("uy-kape-hacked-mode") === "true",
    );
    expect(isHacked).toBe(true);

    // The html element should have hacked-mode class
    const hasClass = await page.evaluate(() =>
      document.documentElement.classList.contains("hacked-mode")
    );
    expect(hasClass).toBe(true);
  });

  test("welcome page shows hacked copy when hacked mode is on", async ({ page }) => {
    // Enable hacked mode via localStorage before navigation
    await page.goto("/");
    await page.evaluate(() =>
      localStorage.setItem("uy-kape-hacked-mode", "true")
    );
    await page.reload();

    // Hacked tagline
    await expect(page.getByText("Order the world's worst drinks!"))
      .toBeVisible();

    // Hacked button label
    await expect(page.getByRole("link", { name: /Get Poisoned Here/i }))
      .toBeVisible();
  });

  test("welcome page shows normal copy when hacked mode is off", async ({ page }) => {
    await page.goto("/");

    // Normal tagline
    await expect(page.getByText("Brewing fellowship, one cup at a time"))
      .toBeVisible();

    // Normal button label
    await expect(page.getByRole("link", { name: /Order Here/i })).toBeVisible();
  });

  test("guest drink cards show prefixed names when hacked mode is on", async ({ page }) => {
    // Enable hacked mode
    await page.goto("/");
    await page.evaluate(() =>
      localStorage.setItem("uy-kape-hacked-mode", "true")
    );

    // Navigate to guest order page (bypass the password if set)
    await page.goto("/order");
    await page.waitForLoadState("networkidle");

    // Handle potential guest password protection
    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passwordInput.fill(GUEST_PASSWORD);
      await page.keyboard.press("Enter");
      await page.waitForLoadState("networkidle");
    }

    // DrinkCards should show at least some prefixed names
    const drinkCards = page.locator('[data-testid^="drink-card-"]');
    const count = await drinkCards.count();

    if (count > 0) {
      // Get all visible drink headings
      const headings = page.locator('[data-testid^="drink-card-"] h4');
      const allText = await headings.allTextContents();

      // At least some should have a hacked prefix (The Worst, The Awful, etc.)
      const prefixedCount = allText.filter((t) =>
        /^(The Worst|The Most Disgusting|The Awful|The Terrible|The Horrible|The Putrid|The Wretched|The Foul|The Vile|The Revolting|The Dreadful|The Sickening)/i
          .test(t)
      ).length;

      expect(prefixedCount).toBeGreaterThan(0);
    }
  });

  test("admin menu management shows original drink names (no prefix) in hacked mode", async ({ page }) => {
    await loginToAdmin(page);

    // Turn on hacked mode
    await page.getByTestId("hacked-mode-toggle").click();
    await expect(page.getByTestId("hacked-mode-toggle")).toHaveAttribute(
      "aria-checked",
      "true",
    );

    // Navigate to menu management → drinks tab
    await page.goto("/admin?view=menu&tab=drinks");
    await page.waitForLoadState("networkidle");

    // Get drink headings in admin view
    const headings = page.locator("h3");
    const allText = await headings.allTextContents();

    // None should have a hacked prefix
    const prefixedCount =
      allText.filter((t) =>
        /^(The Worst|The Most Disgusting|The Awful|The Terrible|The Horrible|The Putrid|The Wretched|The Foul|The Vile|The Revolting|The Dreadful|The Sickening)/i
          .test(t)
      ).length;

    expect(prefixedCount).toBe(0);
  });
});
