import { test, expect } from '@playwright/test';

// AI-GENERATED — VERBATIM, from an actual Playwright MCP browser session.
// Produced from tests/ai-track/scenario.md only (see prompt-log.md for the
// full step-by-step MCP trace: browser_navigate / browser_snapshot /
// browser_fill_form / browser_click calls against the live app).
//
// Unlike the superseded blind-generation draft (prompt-log.md, "Attempt 1 —
// no MCP"), every step below was actually observed before moving to the
// next: the login locator fallback and the double-click-to-add behavior were
// both discovered live — an accessibility snapshot taken right after
// navigating to /cart with only one click done showed the page still
// reading "Giỏ hàng của bạn đang trống" (cart empty), so a second click was
// tried and confirmed to work before this script was written down. That's
// why this "verbatim" draft, unlike Attempt 1's, does not pass on an empty
// cart — but it still has audit-worthy gaps, see assertions-diff.md.
test('customer can log in, add a product to cart, and see it in the cart', async ({ page }) => {
  await page.goto('/login');
  // Login <label>s aren't associated to their <input>s (no htmlFor/id), so
  // getByLabel() has nothing to match — discovered live when the snapshot
  // showed two nameless textboxes; fell back to a positional locator.
  await page.locator('form input').nth(0).fill('test@eshop.com');
  await page.locator('form input').nth(1).fill('Test1234!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Open the first product from the catalog
  await page.getByRole('link', { name: 'Xem chi tiết' }).first().click();

  // Add it to the cart — one click was observed live to leave the cart
  // empty, a second click was observed live to actually add the item.
  const addButton = page.getByRole('button', { name: 'Thêm vào giỏ hàng' });
  await addButton.click();
  await addButton.click();

  // Go to the cart and check the product is there
  await page.getByRole('link', { name: 'Giỏ hàng' }).click();
  await expect(page.getByText('iPhone 15 Pro Max')).toBeVisible();
});
