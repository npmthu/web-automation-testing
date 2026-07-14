import { test, expect } from '@playwright/test';

test('FR-08 Checkout: login, add item, and complete checkout successfully', async ({ page }) => {
  await page.goto('/login');

  // Login with seeded user
  await page.getByRole('textbox').first().fill('test@eshop.com');
  await page.getByRole('textbox').nth(1).fill('Test1234!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText(/Chào,/)).toBeVisible();

  // Add first product from Home page
  await page.goto('/');
  const firstCard = page.locator('.grid > div').first();
  const productName = await firstCard.locator('h2').innerText();
  await firstCard.getByRole('button', { name: 'Thêm vào giỏ' }).click();

  // Go to cart and proceed to checkout
  await page.getByRole('link', { name: 'Giỏ hàng' }).click();
  await expect(page).toHaveURL(/\/cart/);
  await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();

  // Verify checkout page shows the selected product
  await expect(page).toHaveURL(/\/checkout/);
  await expect(page.getByText(productName)).toBeVisible();

  // Confirm checkout
  await page.getByRole('button', { name: 'Xác Nhận Thanh Toán' }).click();
  await expect(page.getByText('Thanh toán thành công!')).toBeVisible();
});
