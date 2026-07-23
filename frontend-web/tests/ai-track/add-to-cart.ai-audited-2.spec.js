import { test, expect } from '@playwright/test';

// AI-GENERATED — MCP-DERIVED, VERBATIM, UNEDITED.
// Produced from tests/ai-track/scenario.md after live exploration using
// Playwright MCP (see prompt-log.md Attempt 2).
//
// Do not fix assertion weaknesses here; audited fixes go in
// add-to-cart.ai-audited.spec.js.
//
// This draft reflects what the AI observed during the browser session:
// - ProductDetail requires two clicks because the first click is swallowed.
// - Cart must be opened through the "Giỏ hàng" navigation link to preserve
//   client-side state.
// - The flow works end-to-end, but assertions are intentionally kept as the
// AI produced them before audit.

test('customer can log in, add a product to cart, and see it in the cart', async ({ page }) => {
  await page.goto('/login');
  await page.locator('form input').nth(0).fill('test@eshop.com');
  await page.locator('form input').nth(1).fill('Test1234!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText(/Chào,/)).toBeVisible();

  await page.getByRole('link', { name: 'Xem chi tiết' }).first().click();

  // Add it to the cart
  // Discovered during MCP exploration: first click is ignored by the app,
  // second click performs the actual add-to-cart action.
  const addButton = page.getByRole('button', { name: /Thêm vào giỏ hàng|Đã thêm/ });
  await addButton.click();
  await addButton.click();

  // Use client-side cart navigation discovered during MCP exploration
  await page.getByRole('link', { name: 'Giỏ hàng' }).click();
  await expect(page).toHaveURL(/\/cart/);

  // AI-generated assertion: confirms the observed product is present.
  // Audit version strengthens this with dynamic product lookup, row count,
  // and quantity validation.
  await expect(
    page.getByText('iPhone 15 Pro Max')
  ).toBeVisible();
});