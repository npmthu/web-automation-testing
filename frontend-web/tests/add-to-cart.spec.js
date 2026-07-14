import { test, expect } from '@playwright/test';

// FR-07 Add-to-Cart (WAT-11): login → add to cart → cart reflects the item.
// Single continuous test: cart state lives only in React memory (CartContext),
// so navigation must happen via UI clicks (client-side routing), never
// page.goto(), or the cart would be lost on a full page reload.
// Note: This test will be performed in one random product. It's recommended to test it in a clean state
test('login → add to cart → giỏ hàng cập nhật đúng', async ({ page }) => {
  // 1. Login with seeded test user (backend/database.js)
  await page.goto('/login');
  await page.locator('form input').nth(0).fill('test@eshop.com'); // labeled "Username" but is actually the email field
  await page.locator('form input').nth(1).fill('Test1234!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Logged-in header state confirms login succeeded
  await expect(page.getByText(/Chào,/)).toBeVisible();

  // 2. Add to cart from Home (single click; ProductDetail has an intentional
  // double-click bug that would make this assertion flaky)
  const firstCard = page.locator('.grid > div').first();
  const productName = await firstCard.locator('h2').innerText();
  await firstCard.getByRole('button', { name: 'Thêm vào giỏ' }).click();

  // 3. Navigate via the nav link (client-side route change preserves cart state)
  await page.getByRole('link', { name: 'Giỏ hàng' }).click();
  await expect(page).toHaveURL(/\/cart/);

  // 4. Assert cart state ("badge" reinterpreted as cart contents, since the
  // header renders no item-count badge in this SUT)
  const rows = page.locator('table tbody tr');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText(productName);
  await expect(rows.first().locator('td').nth(2)).toHaveText('1');
});
