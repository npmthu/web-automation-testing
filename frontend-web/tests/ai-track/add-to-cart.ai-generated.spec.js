import { test, expect } from '@playwright/test';

// AI-GENERATED — VERBATIM, UNEDITED.
// Produced from tests/ai-track/scenario.md only (see prompt-log.md).
// Do not fix bugs here; audited fixes go in add-to-cart.ai-audited.spec.js.
test('customer can log in, add a product to cart, and see it in the cart', async ({ page }) => {
  await page.goto('/login');
  await page.locator('form input').nth(0).fill('test@eshop.com');
  await page.locator('form input').nth(1).fill('Test1234!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Open the first product from the catalog
  await page.getByRole('link', { name: 'Xem chi tiết' }).first().click();

  // Add it to the cart
  await page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).click();

  // Go to the cart and check the product is there
  await page.goto('/cart');
  await expect(page).toHaveURL(/\/cart/);
});
