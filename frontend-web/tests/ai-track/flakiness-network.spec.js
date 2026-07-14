import { test, expect } from '@playwright/test';
import { emulateSlowNetwork } from '../helpers/network-throttle.js';

// WAT-18 — hand-written vs AI-audited FR-07 flow, run under a throttled
// network (~500kbps, 400ms latency). Run with --repeat-each=3 to get 3 runs
// per version; results transcribed into metrics/flakiness.md.

test.beforeEach(async ({ page }) => {
  await emulateSlowNetwork(page);
});

test('hand-written flow under slow network', async ({ page }) => {
  await page.goto('/login');
  await page.locator('form input').nth(0).fill('test@eshop.com');
  await page.locator('form input').nth(1).fill('Test1234!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText(/Chào,/)).toBeVisible();

  const firstCard = page.locator('.grid > div').first();
  const productName = await firstCard.locator('h2').innerText();
  await firstCard.getByRole('button', { name: 'Thêm vào giỏ' }).click();

  await page.getByRole('link', { name: 'Giỏ hàng' }).click();
  await expect(page).toHaveURL(/\/cart/);

  const rows = page.locator('table tbody tr');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText(productName);
  await expect(rows.first().locator('td').nth(2)).toHaveText('1');
});

test('ai-audited flow under slow network', async ({ page }) => {
  await page.goto('/login');
  await page.locator('form input').nth(0).fill('test@eshop.com');
  await page.locator('form input').nth(1).fill('Test1234!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText(/Chào,/)).toBeVisible();

  await page.getByRole('link', { name: 'Xem chi tiết' }).first().click();
  await page.waitForURL(/\/product\//); // avoid reading Home's h1s mid-navigation (see metrics/flakiness.md)
  const productName = await page.locator('h1').innerText();

  const addButton = page.getByRole('button', { name: /Thêm vào giỏ hàng|Đã thêm/ });
  await addButton.click();
  await addButton.click();

  await page.getByRole('link', { name: 'Giỏ hàng' }).click();
  await expect(page).toHaveURL(/\/cart/);

  const rows = page.locator('table tbody tr');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText(productName);
  await expect(rows.first().locator('td').nth(2)).toHaveText('1');
});
