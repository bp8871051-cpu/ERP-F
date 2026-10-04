import { test, expect } from '@playwright/test';

test.describe('Phase 3: Authentication & Session Testing', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('1. Valid user login -> Login successful & redirects to dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page.locator('text=Falcon ERP Platform')).toBeVisible();

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill('admin@falconerp.com');
    await passwordInput.fill('password');
    await submitBtn.click();

    await page.waitForURL('**/app/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/.*\/app\/dashboard/);
    await expect(page.locator('text=Alexander Wright').first()).toBeVisible();
  });

  test('2. Invalid user credentials -> Login rejected with error', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill('nonexistent@falconerp.com');
    await passwordInput.fill('wrongpassword123');
    await submitBtn.click();

    // Verify error message appears and user remains on login page
    const errorAlert = page.locator('.bg-rose-50');
    await expect(errorAlert).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('3. Unauthenticated user -> Protected page direct access rejected', async ({ page }) => {
    // Clear localStorage to ensure fresh unauthenticated state
    await page.goto('http://localhost:5173/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Try direct URL access to protected routes
    await page.goto('http://localhost:5173/app/dashboard');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/login/);

    await page.goto('http://localhost:5173/app/inventory/products');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('4. Logout flow -> Session invalidated & direct URL cannot reopen', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login');
    await page.locator('input[type="email"]').fill('admin@falconerp.com');
    await page.locator('input[type="password"]').fill('password');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/app/dashboard', { timeout: 15000 });

    // Open profile dropdown in Topbar using test ID
    const profileBtn = page.locator('#topbar-profile-button');
    await profileBtn.click();

    // Click Sign Out using test ID
    const signOutBtn = page.locator('#topbar-signout-button');
    await expect(signOutBtn).toBeVisible({ timeout: 5000 });
    await signOutBtn.click();

    // Verify redirected to /login via client-side routing
    await expect(page).toHaveURL(/.*\/login/, { timeout: 15000 });

    // Try direct URL access after logout
    await page.goto('http://localhost:5173/app/dashboard');
    await expect(page).toHaveURL(/.*\/login/, { timeout: 15000 });
  });
});
