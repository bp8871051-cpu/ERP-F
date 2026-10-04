import { test, expect } from '@playwright/test';

test.describe('Dreams / Falcon ERP System Smoke Test', () => {
  test('Loads login page, logs in as Super Admin, and verifies dashboard', async ({ page }) => {
    // 1. Visit login page
    await page.goto('http://localhost:5173/login');
    await expect(page).toHaveTitle(/Falcon ERP|Dreams ERP/);

    const brandHeading = page.locator('text=Falcon ERP Platform');
    await expect(brandHeading).toBeVisible();

    // 2. Submit login with seeded credentials
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 3. Verify redirected to /app/dashboard
    await page.waitForURL('**/app/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/.*\/app\/dashboard/);

    // 4. Verify sidebar and dashboard header
    const sidebarBrand = page.locator('text=Falcon ERP').first();
    await expect(sidebarBrand).toBeVisible();

    // 5. Verify user profile name in sidebar
    const userProfile = page.locator('text=Alexander Wright').first();
    await expect(userProfile).toBeVisible();
  });
});
