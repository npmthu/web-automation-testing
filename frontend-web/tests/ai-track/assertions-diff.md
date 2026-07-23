# Assertion diff — AI-generated vs hand-written (FR-07 Add-to-Cart)

> **Redone with Playwright MCP** (see prompt-log.md). This supersedes the
> original WAT-15 comparison, which was done with blind code generation (no
> browser tool) because Playwright MCP was not available in that environment.
>
> The original blind-generation attempt is kept in prompt-log.md
> ("Attempt 1") as an audit trail because it demonstrates a real
> false-negative class.

## Test versions and results

Three versions were compared after the MCP redo:

| # | File | Result |
|---|------|--------|
| 1 | `tests/add-to-cart.spec.js` (hand-written, WAT-11) | ✓ pass |
| 2 | `tests/ai-track/add-to-cart.ai-generated-2.spec.js` (AI, MCP-derived raw) | ✓ pass — correct |
| 3 | `tests/ai-track/add-to-cart.ai-audited.spec.js` (AI, audited) | ✓ pass |

The original Attempt 1 file:

| File | Result |
|---|---|
| `tests/ai-track/add-to-cart.ai-generated.spec.js` (AI, no MCP) | ✗ failed / false-negative class |

was kept separately because it represents the blind-generation experiment.

The MCP-derived draft was written only after the agent observed the live
application state through Playwright MCP snapshots. During exploration, the
agent first observed an empty cart after a single click, then discovered that
the application required a second click before the item appeared in the cart.
Therefore, the single-click / `page.goto('/cart')` failure mode from Attempt 1
could not survive the MCP workflow.

## Side-by-side

| Aspect | Hand-written (#1) | AI-generated, MCP-derived (#2) | AI-generated, audited (#3) |
|---|---|---|---|
| Login locator | `form input >> nth(0/1)` | `form input >> nth(0/1)` (same fallback, discovered live via snapshot) | same |
| Add-to-cart page | Home (`Home.jsx`, 1-click) | ProductDetail (`ProductDetail.jsx`), clicks **twice** (discovered live, not guessed) | ProductDetail, clicks twice (documented) |
| Cart navigation | Click "Giỏ hàng" link (client-side route) | Click "Giỏ hàng" link | Click "Giỏ hàng" link |
| Cart assertion | Row count = 1, product name, quantity = '1' | `expect(page.getByText('iPhone 15 Pro Max')).toBeVisible()` — hardcoded name, containment only | Row count = 1, dynamic product name, quantity = '1' |
| Product name source | Read from page (`firstCard.locator('h2')`) | **Hardcoded literal** — happens to match because product #1 was opened | Read from page (`page.locator('h1')`) |
| Robust to catalog reorder / different product | Yes | **No** — breaks if a different product is opened | Yes |
| Robust to stray extra cart row | Yes (row count assertion) | **No** — text visibility alone does not detect extra rows | Yes |
| Navigation-race guard (SPA route swap) | N/A (never navigates to ProductDetail) | Not present | `waitForURL(/\/product\//)` |
| Actual cart state when assertion runs | 1 item (correct) | 1 item (correct) | 1 item (correct) |
| Test verdict | pass (correct) | pass (correct) | pass (correct) |

## What changed vs. Attempt 1

Attempt 1 demonstrated a **correctness failure**:
the AI-generated test looked reasonable but did not verify the actual business
behavior. It clicked once, navigated with `page.goto('/cart')`, and only
checked the URL, allowing the test to miss that the cart was empty.

The MCP workflow removed this specific problem because the agent observed the
real DOM state during execution. When the cart appeared empty, the agent could
adapt before generating the final test.

However, Playwright MCP does not automatically solve test design quality.
The MCP-derived draft still contained weaker assertions because it only encoded
what was necessary to confirm the observed scenario.

The audit pass improved robustness by:
- reading the product name dynamically,
- checking cart row count,
- checking quantity,
- adding navigation stability guards.

Therefore, MCP reduces **behavioral blindness**, but audit is still needed
to improve **maintainability and regression detection**.

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
