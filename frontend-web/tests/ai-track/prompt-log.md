# Prompt log — WAT-15 (AI rewrite of Add-to-Cart, FR-07)

## AI Disclosure

**Tool used: Playwright MCP** (`mcp__playwright__browser_navigate`,
`browser_snapshot`, `browser_fill_form`, `browser_click`), driven by Claude
Code, against the live EShop app (`frontend-web` on :5173, `backend` on
:3000, both started locally for this session). This is the tool named in
`Tool_Survey_Proposal.md`; an earlier attempt at this ticket (kept below as
"Attempt 1") used blind code generation instead because MCP wasn't available
in that environment at the time — it is superseded by this session but kept
verbatim as an audit trail, since it documents a real false-negative that's
useful evidence for [AI-02].

## Input (the only thing the agent saw before acting)

`tests/ai-track/scenario.md` — the same 5-step plain-language QA scenario for
FR-07 used in Attempt 1. Not shown: `Login.jsx`, `ProductDetail.jsx`,
`Home.jsx`, `CartContext.jsx`, or the hand-written test from WAT-11. Source
files were only opened *after* the live session, during the audit step (see
below), to confirm root causes already observed through the browser.

## Attempt 2 (current) — live MCP session

Step-by-step, each step's tool result read before deciding the next action:

1. `browser_navigate` to `/login`, then `browser_snapshot`. The accessibility
   tree showed two nameless `textbox` nodes under labels "Username" /
   "Mật khẩu" — no accessible name, so `getByLabel()` would not have worked.
   Used `browser_fill_form` targeting the raw element refs; the tool itself
   resolved this to `page.getByRole('textbox').first()` / `.nth(1)`, the same
   fallback pattern as the WAT-11 hand-written test.
2. `browser_click` the "Sign In" button → landed on `/`, snapshot confirmed
   "Chào, Test User" in the header (logged in).
3. Snapshot of `/` showed 5 product cards, each with a "Xem chi tiết" link
   and its own "Thêm vào giỏ" button. Per the scenario's literal wording
   ("open one of the products, add it to my cart"), clicked "Xem chi tiết"
   on the first card → `/product/1`.
4. Snapshot of the product page showed a "Thêm vào giỏ hàng" button.
   `browser_click`'d it once. A follow-up snapshot showed the button
   re-rendered (new ref) but with the **same label** — no visible
   confirmation.
5. Clicked "Giỏ hàng" in the nav (client-side route, not `page.goto`) and
   took a snapshot: the cart page read **"Giỏ hàng của bạn đang trống"**
   (cart is empty). This is the live signal Attempt 1 never had — a
   real-DOM check that the flow, as performed, did not actually work.
6. Went back to `/product/1` and repeated the add-to-cart click **twice**
   this time, then navigated to the cart again. Snapshot showed a real
   table row: `iPhone 15 Pro Max | 30,000,000 ₫ | 1 | 30,000,000 ₫`. Confirmed
   working.
7. Wrote `add-to-cart.ai-generated.spec.js` from this successful trace. Ran
   it for real (`npx playwright test`) — **passed, and this time it is a true
   positive**, not the false negative from Attempt 1.

## Audit step (after the live session)

With the flow confirmed working end-to-end, opened `ProductDetail.jsx` to
understand *why* one click wasn't enough, rather than just accepting "click
twice" as an opaque fact:

```js
const handleAddToCart = () => {
  if (clickCount === 0) { setClickCount(1); return; } // swallows the 1st click
  addToCart(product, parseInt(quantity));
  setAdded(true);
  setClickCount(0);
  setTimeout(() => setAdded(false), 2000); // "Đã thêm" is a 2s transient state
};
```

This explains two things observed live in step 4–6: (a) the first click does
nothing by design (`clickCount === 0` guard), and (b) the button briefly
shows "Đã thêm" after a successful add, which the live session's snapshot
missed by ~2s of tool round-trip latency — not something the raw session
would have caught, but relevant for a test that clicks and asserts fast.

Audit fixes applied in `add-to-cart.ai-audited.spec.js` (full list + rationale
in that file's header comment and in `assertions-diff.md`):
1. Read the product name dynamically instead of hardcoding "iPhone 15 Pro Max".
2. Assert cart row count + quantity, not just that the name is visible.
3. `waitForURL(/\/product\//)` before reading the `<h1>` — carried over from
   the WAT-18 throttled-network finding, still applicable since a plain
   Playwright `.click()` doesn't wait for the SPA route swap the way the MCP
   tool call appeared to.
4. Match `/Thêm vào giỏ hàng|Đã thêm/` to tolerate the transient state.

Re-ran both `add-to-cart.ai-generated.spec.js` and `add-to-cart.ai-audited.spec.js`
alongside the WAT-11 hand-written test — all 3 passed (`npx playwright test`,
3/3, ~5s).

## What this redo changes vs. Attempt 1

Attempt 1's finding was that blind generation produces **false negatives**
(passes while the underlying flow is broken) because the AI never sees the
DOM. With Playwright MCP, that specific gap disappears: the agent observes
the same live signals a human tester would (an empty-cart message, an
unchanged button label) and self-corrects *during* generation, before any
script is written down. What MCP does not fix is test **design quality** —
the MCP-derived draft still asserts loosely (hardcoded name, containment-only
check) because that was enough to confirm what was just observed. See
`assertions-diff.md` for the full comparison and the reframed takeaway.

## Material for [AI-02] (WAT-30)

This log + `assertions-diff.md` are the primary raw material for the AI Audit
Report: they now show two distinct AI-testing failure modes across the two
attempts — a **correctness** gap (blind generation, Attempt 1) and a
**robustness/design** gap (tool-using generation, Attempt 2) — and the exact
edit distance an audit pass adds in each case.

---

## Attempt 1 — no MCP (superseded, kept as audit trail)

**Tool actually used: Claude Code (Anthropic), not GitHub Copilot Agent Mode /
Cursor / Playwright MCP as named in `Tool_Survey_Proposal.md`.** This
environment didn't have Copilot Agent Mode, a Testim account, or Playwright
MCP available at the time, so Claude Code stood in as the "AI" for this
experiment, playing the same role: given only a plain-language scenario,
generate a Playwright script, run it for real against the live EShop app, and
iterate on what breaks. All findings below came from actually executing the
scripts, not from guessing.

### Draft 1 → verbatim (superseded content, no longer in the repo)

Reasonable first-pass choices from the scenario text alone:
- "log in" → `page.getByLabel('Username')` / `('Password')` (standard
  Playwright best practice for a login form).
- "open one of the products" → click the first "Xem chi tiết" link → lands
  on `ProductDetail.jsx`.
- "add it to my cart" → click "Thêm vào giỏ hàng" **once**.
- "go to my cart and check" → `page.goto('/cart')` + assert the URL only.

**Ran it. Result: failed** — `getByLabel('Username')` timed out (same label
bug rediscovered live in Attempt 2, step 1). Replaced with
`page.locator('form input').nth(0/1)`.

**Ran it again. Result: passed — but a false negative.** The cart was
actually empty for two independent reasons the assertion couldn't see: (1)
`ProductDetail.jsx` swallows the first click (`clickCount === 0` → return),
and (2) `page.goto('/cart')` triggers a full reload, wiping `CartContext`'s
in-memory state regardless of (1). Because blind generation never looks at
the DOM after acting, neither bug was visible to the tool that wrote the
test — that's the core difference Attempt 2 was run to test.

### Draft 2 → human audit (superseded content, no longer in the repo)

Same four fixes now folded into the current `add-to-cart.ai-audited.spec.js`:
double-click, nav via the "Giỏ hàng" link, real cart-content assertions, and
(added later, during WAT-18) `waitForURL` before reading the product `<h1>`.
