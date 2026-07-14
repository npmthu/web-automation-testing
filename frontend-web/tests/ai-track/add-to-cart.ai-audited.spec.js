import { test, expect } from '@playwright/test';

// AUDITED / REFACTORED from add-to-cart.ai-generated.spec.js (the Playwright
// MCP-derived draft). See prompt-log.md for the full session and
// assertions-diff.md for the side-by-side comparison. Fixes applied:
//   1. Read the product name dynamically from the page instead of hardcoding
//      "iPhone 15 Pro Max" — the generated draft's assertion only works
//      because it happens to open the first catalog item; it breaks the
//      moment catalog order changes or the test targets a different
//      product.
//   2. Assert actual cart contents (row count, product name, quantity cell),
//      not just that the product name text appears somewhere on the page —
//      a stray leftover row, or the name appearing twice, would still
//      satisfy the generated draft's assertion.
//   3. Wait for the URL to actually change to /product/... before reading the
//      product's <h1> — found via WAT-18's throttled-network run: a plain
//      Playwright .click() (unlike the MCP tool call used to generate this
//      test, which appears to add its own settling wait) does not wait for
//      the SPA route swap, so reading the heading right after .click()
//      sometimes raced it and hit Home's own two <h1>s instead (strict-mode
//      violation), especially under added latency. See metrics/flakiness.md.
//   4. Match the button's transient "Đã thêm" state as well as "Thêm vào
//      giỏ hàng" — confirmed by reading ProductDetail.jsx after the live
//      session (not guessed): a successful click flips the label for 2s
//      (setTimeout), so a click landing in that window could otherwise miss
//      the button by name.
test('customer can log in, add a product to cart, and see it in the cart', async ({ page }) => {
  await page.goto('/login');
  await page.locator('form input').nth(0).fill('test@eshop.com');
  await page.locator('form input').nth(1).fill('Test1234!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText(/Chào,/)).toBeVisible();

  await page.getByRole('link', { name: 'Xem chi tiết' }).first().click();
  await page.waitForURL(/\/product\//); // avoid reading Home's h1s mid-navigation
  const productName = await page.locator('h1').innerText();

  const addButton = page.getByRole('button', { name: /Thêm vào giỏ hàng|Đã thêm/ });
  await addButton.click(); // 1st click: swallowed by the double-click bug
  await addButton.click(); // 2nd click: actually adds to cart

  await page.getByRole('link', { name: 'Giỏ hàng' }).click();
  await expect(page).toHaveURL(/\/cart/);

  const rows = page.locator('table tbody tr');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText(productName);
  await expect(rows.first().locator('td').nth(2)).toHaveText('1');
});
