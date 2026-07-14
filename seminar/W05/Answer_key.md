## Answer Key (facilitator reference at 0:20–0:25 — do not reveal to the class beforehand)

**Expected findings** (based on the team's own prior experiment — see `metrics/flakiness.md`):

- Team A tends to prefer `getByLabel`/`getByRole` when the form has labels; it falls back to positional locators (`getByRole('textbox').first()`) exactly where EShop's login form lacks `aria-label` — this is the failure mode documented in Part VI, item 4 of the main report.
- Team B tends to pick short locators, favoring role/text when the AI has live-page context (Playwright MCP); if it only has repo context, there's a risk of "inventing" a locator that doesn't exist (e.g. `#cart-badge`, which isn't real) — see Part V, §16 Part B.
- Both teams may see failures on Slow 4G if the test uses a hard `sleep()` instead of `expect().toBeVisible()` (auto-wait / web-first assertions).

**Reference rubric (per Playwright's own priority order):**

1. Role-based (`getByRole`)
2. Label/text-based (`getByLabel`, `getByText`)
3. `data-test-id` — the stable long-term fallback when the page lacks semantic markup
4. Positional CSS/XPath — acceptable, but must be flagged with a comment as fragile

**3 takeaways to deliver at the end:**

1. AI-generated locators aren't automatically robust when the page lacks semantic attributes.
2. User-facing locators come first; test IDs are the stable fallback, not the first choice.
3. Self-healing reduces noise but can mask real defects — always pair it with human review.

---