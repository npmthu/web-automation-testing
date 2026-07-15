import { test, expect } from '@playwright/test';
import { emulateSlowNetwork } from './helpers/network-throttle.js';

// WAT-13 — extends WAT-18's flakiness protocol (which only covered FR-07)
// to the other two flows: FR-02 (login) and FR-08 (checkout). Same helper
// (`emulateSlowNetwork`, Fast-3G-like: 1.6Mbps/750kbps/150ms) and same dev
// server, so results are directly comparable in the same metrics/flakiness.md
// table. THROTTLE=1 env var toggles throttling on, so the same file gives
// both the throttled runs and the normal-network baseline.
//
// Steps are split so the JSON reporter records "setup" vs "run" separately:
// - FR-02: setup = navigate to /login; run = fill + submit + assert.
// - FR-08: setup = login; run = add to cart + checkout + assert success.

test.beforeEach(async ({ page }) => {
  if (process.env.THROTTLE) {
    await emulateSlowNetwork(page);
  }
});

test('FR-02 login', async ({ page }) => {
  await test.step('setup: navigate to /login', async () => {
    await page.goto('/login');
  });

  await test.step('run: fill + submit + assert', async () => {
    await page.locator('form input').nth(0).fill('test@eshop.com');
    await page.locator('form input').nth(1).fill('Test1234!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText(/Chào,/)).toBeVisible();
  });
});

test('FR-08 checkout', async ({ page }) => {
  await test.step('setup: login', async () => {
    await page.goto('/login');
    await page.locator('form input').nth(0).fill('test@eshop.com');
    await page.locator('form input').nth(1).fill('Test1234!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText(/Chào,/)).toBeVisible();
  });

  await test.step('run: add to cart + checkout', async () => {
    await page.goto('/');
    const firstCard = page.locator('.grid > div').first();
    const productName = await firstCard.locator('h2').innerText();
    await firstCard.getByRole('button', { name: 'Thêm vào giỏ' }).click();

    await page.getByRole('link', { name: 'Giỏ hàng' }).click();
    await expect(page).toHaveURL(/\/cart/);
    await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();

    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByText(productName)).toBeVisible();

    await page.getByRole('button', { name: 'Xác Nhận Thanh Toán' }).click();
    await expect(page.getByText('Thanh toán thành công!')).toBeVisible();
  });
});
