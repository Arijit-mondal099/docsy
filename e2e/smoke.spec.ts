import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
    // Landing page should mention the product name
    await expect(page.locator('h1').first()).toContainText(/chat|pdf|docs/i);
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    // Login form should exist
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('redirects to login when accessing protected route', async ({ page }) => {
    await page.goto('/documents');
    // Should redirect to login since not authenticated
    await page.waitForURL('/login', { timeout: 10000 });
  });

  test('features section exists on landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#features')).toBeVisible();
  });

  test('pricing section exists on landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#pricing')).toBeVisible();
  });
});
