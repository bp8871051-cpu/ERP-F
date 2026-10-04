import { test, expect } from '@playwright/test';

test.describe('Phase 4: Complete Role-Based Access Control (RBAC) & Permission Testing', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('1. Super Admin -> Full sidebar access and permitted page navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.locator('input[type="email"]').fill('admin@falconerp.com');
    await page.locator('input[type="password"]').fill('password');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*\/app\/dashboard/, { timeout: 30000 });

    // Verify all module headers exist in sidebar
    await expect(page.locator('text=Inventory').first()).toBeVisible();
    await expect(page.locator('text=Sales').first()).toBeVisible();
    await expect(page.locator('text=HRM').first()).toBeVisible();
    await expect(page.locator('text=CRM').first()).toBeVisible();

    // Direct URL to Inventory
    await page.goto('http://localhost:5173/app/inventory/products');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*\/app\/inventory\/products/);
    await expect(page.locator('text=403 Forbidden')).not.toBeVisible();

    // Direct URL to HRM
    await page.goto('http://localhost:5173/app/hrm/employees');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*\/app\/hrm\/employees/);
    await expect(page.locator('text=403 Forbidden')).not.toBeVisible();
  });

  test('2. HR Manager -> Sidebar shows HRM, hides Inventory, direct URL to Inventory shows 403 Access Denied', async ({ page, request }) => {
    // 1. Login as HR Manager
    await page.goto('http://localhost:5173/login');
    await page.locator('input[type="email"]').fill('hr@falconerp.com');
    await page.locator('input[type="password"]').fill('password');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*\/app\/dashboard/, { timeout: 30000 });

    // 2. Sidebar verification: HRM is visible, Inventory is hidden
    await expect(page.locator('text=HRM').first()).toBeVisible();
    await expect(page.locator('span:text-is("Inventory")')).not.toBeVisible();
    await expect(page.locator('span:text-is("Sales")')).not.toBeVisible();

    // 3. Permitted module access -> HRM Employees succeeds
    await page.goto('http://localhost:5173/app/hrm/employees');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*\/app\/hrm\/employees/);
    await expect(page.locator('text=403 Forbidden')).not.toBeVisible();

    // 4. CRITICAL: Direct URL access to restricted module /app/inventory/products
    await page.goto('http://localhost:5173/app/inventory/products');
    await page.waitForLoadState('domcontentloaded');

    // Must render the enterprise 403 Access Denied page
    const accessDeniedBadge = page.locator('text=403 Forbidden • Access Denied');
    await expect(accessDeniedBadge).toBeVisible();

    const requiredPermInfo = page.locator('text=inventory.view');
    await expect(requiredPermInfo).toBeVisible();

    const userRoleInfo = page.locator('text=HR Manager').first();
    await expect(userRoleInfo).toBeVisible();

    // 5. CRITICAL: Direct API access test
    // Obtain auth token from localStorage
    const token = await page.evaluate(() => localStorage.getItem('erp_token'));
    expect(token).toBeTruthy();

    // Directly call restricted DELETE /api/v1/products/1 endpoint
    const deleteResponse = await request.delete('http://localhost:8000/api/v1/products/1', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    // Verify backend rejects with HTTP 403 Forbidden
    expect(deleteResponse.status()).toBe(403);
    const deleteJson = await deleteResponse.json();
    expect(deleteJson.status).toBe('error');
    expect(deleteJson.required_permission).toBe('inventory.delete');
  });

  test('3. Inventory Manager -> Sidebar shows Inventory, hides HRM, direct URL to HRM shows 403 Access Denied', async ({ page, request }) => {
    // 1. Login as Inventory Manager
    await page.goto('http://localhost:5173/login');
    await page.locator('input[type="email"]').fill('inventory@falconerp.com');
    await page.locator('input[type="password"]').fill('password');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*\/app\/dashboard/, { timeout: 30000 });

    // 2. Sidebar verification: Inventory is visible, HRM is hidden
    await expect(page.locator('text=Inventory').first()).toBeVisible();
    await expect(page.locator('span:text-is("HRM")')).not.toBeVisible();

    // 3. Permitted module access -> Products succeeds
    await page.goto('http://localhost:5173/app/inventory/products');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*\/app\/inventory\/products/);
    await expect(page.locator('text=403 Forbidden')).not.toBeVisible();

    // 4. CRITICAL: Direct URL access to restricted module /app/hrm/payroll
    await page.goto('http://localhost:5173/app/hrm/payroll');
    await page.waitForLoadState('domcontentloaded');

    // Must render the enterprise 403 Access Denied page
    const accessDeniedBadge = page.locator('text=403 Forbidden • Access Denied');
    await expect(accessDeniedBadge).toBeVisible();

    const requiredPermInfo = page.locator('text=hrm.view');
    await expect(requiredPermInfo).toBeVisible();

    const userRoleInfo = page.locator('text=Inventory Manager').first();
    await expect(userRoleInfo).toBeVisible();

    // 5. CRITICAL: Direct API access test
    const token = await page.evaluate(() => localStorage.getItem('erp_token'));
    expect(token).toBeTruthy();

    // Directly call restricted DELETE /api/v1/hrm/employees/1 endpoint
    const deleteResponse = await request.delete('http://localhost:8000/api/v1/hrm/employees/1', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    // Verify backend rejects with HTTP 403 Forbidden
    expect(deleteResponse.status()).toBe(403);
    const deleteJson = await deleteResponse.json();
    expect(deleteJson.status).toBe('error');
    expect(['hrm.delete', 'hrm.view']).toContain(deleteJson.required_permission);
  });

});
