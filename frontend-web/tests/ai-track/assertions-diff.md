# Assertion diff — AI-generated vs hand-written (FR-07 Add-to-Cart)

> **Redone with Playwright MCP** (see prompt-log.md). This supersedes the
> original WAT-15 comparison, which was done with blind code generation (no
> browser tool) because Playwright MCP wasn't available in that environment.
> The old comparison is kept in prompt-log.md ("Attempt 1") as an audit
> trail, since it documents a real false-negative class that's worth keeping
> as evidence even though it's no longer what `add-to-cart.ai-generated.spec.js`
> contains.

Three versions, all run for real against the live EShop app (backend seeded,
`npx playwright test`):

| # | File | Result |
|---|------|--------|
| 1 | `tests/add-to-cart.spec.js` (hand-written, WAT-11) | ✓ pass |
| 2 | `tests/ai-track/add-to-cart.ai-generated.spec.js` (AI, MCP-derived, raw) | ✓ pass — correct |
| 3 | `tests/ai-track/add-to-cart.ai-audited.spec.js` (AI, audited) | ✓ pass |

All three report green, and this time **all three are true positives** — a
real difference from Attempt 1. The reason: the MCP-derived draft was written
*after* watching the live accessibility snapshot confirm the cart actually
held the product (a table row reading "iPhone 15 Pro Max"), not before. The
single-click / `page.goto('/cart')` false negative from Attempt 1 could not
survive this workflow, because the tool used to generate the test is the same
tool that would have shown the empty-cart state to the person (or agent)
writing it.

## Side-by-side

| Aspect | Hand-written (#1) | AI-generated, MCP-derived (#2) | AI-generated, audited (#3) |
|---|---|---|---|
| Login locator | `form input >> nth(0/1)` | `form input >> nth(0/1)` (same fallback, discovered live via snapshot) | same |
| Add-to-cart page | Home (`Home.jsx`, 1-click) | ProductDetail (`ProductDetail.jsx`), clicks **twice** (discovered live, not guessed) | ProductDetail, clicks twice (documented) |
| Cart navigation | Click "Giỏ hàng" link (client-side route) | Click "Giỏ hàng" link | Click "Giỏ hàng" link |
| Cart assertion | Row count = 1, product name, quantity = '1' | `expect(page.getByText('iPhone 15 Pro Max')).toBeVisible()` — hardcoded name, containment only | Row count = 1, dynamic product name, quantity = '1' |
| Product name source | Read from the page (`firstCard.locator('h2')`) | **Hardcoded literal** — happens to match because product #1 was opened | Read from the page (`page.locator('h1')`) |
| Robust to catalog reorder / different product | Yes | **No** — breaks silently wrong or fails outright if a different product is opened | Yes |
| Robust to a stray extra cart row | Yes (row count assert) | **No** — `toBeVisible()` on text alone doesn't notice extras | Yes |
| Navigation-race guard (SPA route swap) | N/A (never navigates to ProductDetail) | Not present | `waitForURL(/\/product\//)` (WAT-18 finding) |
| Actual cart state when assertion runs | 1 item (correct) | 1 item (correct) | 1 item (correct) |
| Test verdict | pass (correct) | pass (correct) | pass (correct) |

## What changed vs. the Attempt-1 comparison

Attempt 1's headline finding was a **false negative**: an AI-generated test
that read as reasonable and passed, while the cart was actually empty,
because its only assertion checked the URL rather than cart contents. That
gap doesn't exist here — Playwright MCP's `browser_snapshot` calls happened
*during* generation, so the empty-cart bug was caught before the script was
ever written, not after.

What Playwright MCP does **not** automatically fix is test *design*: the
MCP-derived draft still asserts loosely (a single `toBeVisible()` on a
hardcoded name), because that was sufficient to confirm what the person
building the test already saw on screen. It takes an audit pass — thinking
about "what if the catalog changes" or "what if this test runs twice without
cleanup" — to convert "I watched it work once" into an assertion that would
actually fail if the behavior regressed later. The audited version's dynamic
product name, row-count check, and quantity check exist for exactly that
reason.

## Takeaway for [AI-02] / User Guide

Blind code generation (no browser tool) produces **correctness** false
negatives: the AI can't see the DOM, so it writes assertions that would pass
even on broken behavior. Tool-using generation via Playwright MCP closes that
specific gap — the agent sees the same live signals a human tester would —
but it does not close the **robustness/maintainability** gap: assertions
tuned to "the one thing I just watched happen" instead of "the invariant that
should always hold" are still a distinct failure mode, and still need a human
(or a second, adversarial audit pass) to generalize them. That reframing —
from "AI tests lie" to "AI tests over-fit to what was demonstrated" — is the
more accurate lesson once the AI has real-browser feedback.
