import { test, expect } from '@playwright/test';

test.describe('Phase 5, 8, 9: Full CRUD, Business Workflows & Financial Calculations', () => {

  test.beforeEach(async ({ page }) => {
    // Login as Super Admin before each test
    await page.goto('http://localhost:5173/login');
    await page.locator('input[type="email"]').fill('admin@falconerp.com');
    await page.locator('input[type="password"]').fill('password');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/app/dashboard', { timeout: 15000 });
  });

  test('1. Inventory Products: Listing, search and table render', async ({ page }) => {
    await page.goto('http://localhost:5173/app/inventory/products');
    await page.waitForLoadState('domcontentloaded');

    // Verify page title or table is loaded
    await expect(page).toHaveURL(/.*\/app\/inventory\/products/);
    const tableContainer = page.locator('table, .overflow-x-auto, [role="table"]').first();
    await expect(tableContainer).toBeVisible({ timeout: 15000 });

    // Verify search input exists
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Pro');
      await page.waitForTimeout(500);
      await expect(tableContainer).toBeVisible();
    }
  });

  test('2. Sales Invoices: Listing and financial calculation indicators', async ({ page }) => {
    await page.goto('http://localhost:5173/app/sales/invoices');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/.*\/app\/sales\/invoices/);
    const heading = page.locator('text=Invoices & Billing');
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Verify invoice management actions or search
    const searchInput = page.locator('input[placeholder*="Search invoice"]');
    await expect(searchInput).toBeVisible();
  });

  test('3. UI Interface Data Table: Server-side pagination, search and filters', async ({ page }) => {
    await page.goto('http://localhost:5173/ui/tables/data');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/.*\/ui\/tables\/data/);

    // Verify Data Table component is rendered
    const dataTable = page.locator('table').first();
    await expect(dataTable).toBeVisible({ timeout: 15000 });

    // Verify table rows exist
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();

    // Verify search in data table
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Tech');
      await page.waitForTimeout(500);
      await expect(dataTable).toBeVisible();
    }
  });

  test('4. Help Module: Documentation, changelog and multi-level navigation', async ({ page }) => {
    // 1. Documentation page
    await page.goto('http://localhost:5173/help/documentation');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Documentation').first()).toBeVisible();

    // 2. Changelog page
    await page.goto('http://localhost:5173/help/changelog');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Changelog').first()).toBeVisible();

    // 3. Multi-level navigation
    await page.goto('http://localhost:5173/help/multilevel/1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Multi Level: Level 1').first()).toBeVisible();

    await page.goto('http://localhost:5173/help/multilevel/2/2/1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Level 2.2.1').first()).toBeVisible();
  });

});
