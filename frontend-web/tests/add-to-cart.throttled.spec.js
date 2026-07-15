import { test, expect } from "@playwright/test";

// WAT-13: same FR-07 flow as add-to-cart.spec.js (WAT-11), but run under
// emulated network throttling to measure flakiness. Throttling is applied
// via CDP (Chromium only, matches the single "chromium" project in
// playwright.config.js): 600ms latency, ~300kbps down/up.
//
// Precondition (not covered by playwright.config.js's `webServer`, which
// only starts the dev server): run `npm run build && npx vite preview
// --port 4173` in this directory first. Runs against that production build,
// not the Vite dev server — the dev server serves ~90 unbundled ES module
// requests per load, and at throttled latency that never finishes (see
// metrics/flakiness.md, "methodology journey").
//
// The flow is split into two test.step() blocks so the JSON reporter
// records their durations separately: "setup" (navigate + login) vs
// "run" (the add-to-cart + cart assertion actually under test). These map
// to the "setup time" / "run time" columns in metrics/flakiness.md.
//
// test.setTimeout(10_000) is intentionally tight: run sequentially (1
// worker) it never flakes. Run concurrently (`--repeat-each=10 --workers=10`
// on this 8-core machine), real contention on the shared backend (single
// Node event loop + single sqlite3 connection) and CPU-starved Chromium
// instances push some runs past 10s — that is the flake investigated in
// metrics/flakiness.md (root cause: fixed timeout with no headroom for
// concurrent execution, not a bug in the flow itself).
test("login → add to cart → giỏ hàng cập nhật đúng (throttled)", async ({
  page,
}) => {
  test.setTimeout(10_000);

  const client = await page.context().newCDPSession(page);
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 600, // ms
    downloadThroughput: (300 * 1024) / 8, // ~300 kbps in bytes/sec
    uploadThroughput: (300 * 1024) / 8,
  });

  await test.step("setup: login", async () => {
    await page.goto("http://localhost:4173/login");
    await page.locator("form input").nth(0).fill("test@eshop.com");
    await page.locator("form input").nth(1).fill("Test1234!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText(/Chào,/)).toBeVisible();
  });

  await test.step("run: add-to-cart flow", async () => {
    const firstCard = page.locator(".grid > div").first();
    const productName = await firstCard.locator("h2").innerText();
    await firstCard.getByRole("button", { name: "Thêm vào giỏ" }).click();

    await page.getByRole("link", { name: "Giỏ hàng" }).click();
    await expect(page).toHaveURL(/\/cart/);

    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(productName);
    await expect(rows.first().locator("td").nth(2)).toHaveText("1");
  });
});
