## Answer Key (facilitator reference at 0:20–0:25 — do not reveal beforehand)

**Expected findings** (based on the team's own WAT-11/WAT-13/WAT-15 experiments):

- **Team A (hand-crafted):** should default to `getByRole`/`getByText` for the Home/Cart page (labeled, semantic markup available), but is forced into positional locators (`getByRole('textbox').first()` / `.nth(1)`) for the login inputs specifically, because EShop's login form has no `aria-label`. This is the same limitation documented in User_Guide.md §6.

- **Team B (AI-suggested):** if working **with** live-browser grounding (Copilot Agent Mode + Playwright MCP), locators should resemble Team A's — the agent observes the same rendered DOM. If working **without** grounding (repo context only), the real risk demonstrated in the team's own study wasn't an invented selector, but a **false negative**: Attempt 1 (blind generation, no MCP) produced a test that passed even though the cart was actually empty, because `ProductDetail.jsx` swallows the first "Thêm vào giỏ hàng" click (`clickCount === 0` guard) and `page.goto('/cart')` triggers a full reload that wipes `CartContext`'s in-memory state — neither bug was visible to a tool that never inspects the DOM after acting (see `prompt-log.md`, WAT-15, Attempt 1). The MCP-grounded rerun (Attempt 2) caught this live — a snapshot showed "Giỏ hàng của bạn đang trống" — and self-corrected before the script was even written.

- **Assertion strength is the sharper gap, not the locator itself.** Even a live-browser-grounded AI draft may land on a *weak* assertion — e.g. `getByText(productName).toBeVisible()`, a hardcoded name checked only for visibility — which would still pass even if the catalog order changed or an extra row leaked into the cart. The team's own audited version fixed this by reading the product name dynamically and checking row count + quantity (WAT-15, "Attempt 2" → "audited"). A **blind** (non-grounded) AI draft can go further wrong: the team's own Attempt 1 asserted only the cart URL after `page.goto('/cart')`, which passed while the cart was actually empty — a true false negative, not a flaky test.

- **Both teams may see throttle-related failures** if a test uses a hard `sleep()` instead of `expect().toBeVisible()` (auto-wait / web-first assertions) — Playwright's own actionability model retries assertions instead of using fixed waits.

**Reference rubric (per Playwright's own priority order — playwright.dev/docs/best-practices):**

1. Role-based (`getByRole`)
2. Label/text-based (`getByLabel`, `getByText`)
3. `data-test-id` — the stable long-term fallback when the page lacks semantic markup
4. Positional CSS/XPath / `.nth(n)` — acceptable only when 1–3 aren't available, and should be flagged as fragile

**3 takeaways to deliver at the end:**

1. AI-generated locators aren't automatically robust when the page lacks semantic attributes (e.g. EShop's unlabeled login form) — grounding in the live page helps, but doesn't guarantee a stable locator by itself.
2. User-facing locators come first; test IDs are the stable fallback, not the first choice.
3. A passing test is not automatically a correct one — an assertion that only checks navigation or visibility can pass on a genuinely broken feature. Assertion quality matters as much as locator quality, and both AI paths in this team's own study needed a human audit pass to close that gap.

---