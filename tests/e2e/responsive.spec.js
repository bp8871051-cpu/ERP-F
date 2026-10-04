import { test, expect } from '@playwright/test';

test.describe('Phase 11: Comprehensive Responsive & Viewport Testing', () => {

  const viewports = [
    { name: 'Mobile (360x800)', width: 360, height: 800 },
    { name: 'Mobile (390x844)', width: 390, height: 844 },
    { name: 'Mobile (414x896)', width: 414, height: 896 },
    { name: 'Tablet Portrait (768x1024)', width: 768, height: 1024 },
    { name: 'Tablet Landscape (1024x768)', width: 1024, height: 768 },
    { name: 'Desktop Standard (1280x720)', width: 1280, height: 720 },
    { name: 'Desktop Laptop (1440x900)', width: 1440, height: 900 },
    { name: 'Desktop Full HD (1920x1080)', width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    test(`Responsive Audit on ${vp.name} - No Horizontal Page Overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Audit Login page
      await page.goto('http://localhost:5173/login');
      await page.waitForLoadState('domcontentloaded');

      let hasNoOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(hasNoOverflow, `Login page has horizontal overflow on ${vp.name}`).toBe(true);

      // Login to test internal protected pages
      await page.locator('input[type="email"]').fill('admin@falconerp.com');
      await page.locator('input[type="password"]').fill('password');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/app/dashboard', { timeout: 15000 });

      // 2. Audit Dashboard page
      await page.waitForLoadState('domcontentloaded');
      hasNoOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(hasNoOverflow, `Dashboard has horizontal overflow on ${vp.name}`).toBe(true);

      // 3. Audit Inventory Products page
      await page.goto('http://localhost:5173/app/inventory/products');
      await page.waitForLoadState('domcontentloaded');
      hasNoOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(hasNoOverflow, `Products page has horizontal overflow on ${vp.name}`).toBe(true);

      // 4. Audit Documentation page
      await page.goto('http://localhost:5173/help/documentation');
      await page.waitForLoadState('domcontentloaded');
      hasNoOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(hasNoOverflow, `Documentation page has horizontal overflow on ${vp.name}`).toBe(true);

      // 5. Audit UI Interface Buttons page
      await page.goto('http://localhost:5173/ui/base/buttons');
      await page.waitForLoadState('domcontentloaded');
      hasNoOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(hasNoOverflow, `Buttons page has horizontal overflow on ${vp.name}`).toBe(true);
    });
  }

});
