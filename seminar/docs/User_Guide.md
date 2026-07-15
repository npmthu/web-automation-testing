
# Seminar User Guide: Web Automation Testing + Group 7
## Project Overview

**Course:** CSC15003 - Software Testing \
**Topic:** T02 - Web Automation Testing \
**Software Under Test (SUT):** [EShop](https://github.com/ttbhanh/eshop-sut/tree/main) (React + Node.js/Express) \
**Team Members:**

- 23127108 — Lê Hữu Minh Quang
- 23127307 — Nguyễn Phạm Minh Thư (Team Lead)
- 23127364 — Đặng Nguyễn Thành Hiếu
- 23127393 — Nguyễn Đăng Khoa


## Table of Contents

[1. Introduction](#1-introduction) \
[2. Installation and Setup](#2-installation-and-setup) \
[3. First Steps](#3-first-steps) \
[4. Advanced Usage](#4-advanced-usage) \
[5. Troubleshooting](#5-troubleshooting) \
[6. Failure Modes](#6-failure-modes) \
[7. References](#7-references)

## 1. Introduction

Most of what a user actually does on EShop happens through a browser tab: signing in, browsing products, dropping something into a cart, paying. Out of the platform's 22 functional requirements, a sizeable chunk live entirely at that browser layer. Re-checking those flows by hand after every commit doesn't hold up once the codebase grows past a certain size — that's the gap web automation testing is meant to close.

This guide walks through how our team approached that gap for EShop, centered on **Playwright** as the traditional framework and **GitHub Copilot Agent Mode + Playwright MCP** as the grounded AI track used in the seminar comparison. We looked at Selenium 4 and Cypress as alternatives; Playwright won out mostly because of its multi-browser support, the built-in codegen/trace-viewer tooling, and how naturally it fits a TypeScript codebase. The full reasoning behind that decision lives in `Tool_Survey_Proposal.md` from Stage S1 — this document does not repeat it.

A few notes on scope before diving in:

- This is not a Playwright tutorial from scratch. Official docs (linked in Section 7) already cover that ground well.
- Everything here is scoped to what actually changes, or breaks, when the target application is specifically EShop rather than a generic demo site.
- Intended readers: teammates setting up a clean environment, classmates following along during the live seminar, and anyone deciding how the hand-written and AI-assisted flows are actually run on EShop.

## 2. Installation and Setup

**Before you start**, you'll need:

- Node.js — version used by the team: v22.17.1, via nodejs.org or nvm
- npm (ships with Node.js — confirm with `npm -v`)
- Git, to clone both the EShop repo and this one
- OS tested by the team: Windows 11

**Getting EShop running locally:**

## 2.1 Starting the Backend Server

Backend supplies data and business logic; frontend-web is the React SPA that users interact with.

1. Open Terminal (Command Prompt / PowerShell / Terminal).
2. Move to folder `backend`:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Initialize the database and seed data. Only run this command once for the first time or when you want to reset the data:
   ```bash
   node database.js
   ```
5. Start the server:
   ```bash
   node server.js
   ```
   *Terminal will display: `Server is running on http://localhost:3000`.*
   *(Note: You must keep this Terminal window open throughout the testing process).*

## 2.2 Starting the Frontend Web

Frontend is the main interface users use to shop online.

1. Open a new Terminal window.
2. Move to the `frontend-web` directory:
   ```bash
   cd frontend-web
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Web application:
   ```bash
   npm run dev
   ```
   *Terminal will provide a URL (e.g., `http://localhost:5173/`). Click it or copy-paste into your browser to use.*


Before writing a single test, open a browser and confirm EShop responds at http://localhost:5173. A test that fails because the SUT itself isn't up will look identical to a real bug — worth ruling out first.

**Installing Playwright:**

```bash
npm init playwright@latest
```

When prompted, we chose:
- JavaScript 
- default `tests/` folder
- GitHub Actions workflow — optional, can be added later if CI gets set up
- install browsers — yes, this pulls Chromium, Firefox, and WebKit binaries

Sanity check:

```bash
npx playwright test
```

The bundled sample test should pass across all configured browsers — if it doesn't, don't move on to EShop-specific tests yet.

**Wiring Playwright to EShop:** in `playwright.config.js`, set a `baseURL` so specs can use relative paths instead of full URLs everywhere:

```js
use: {
  baseURL: 'http://localhost:5173',
  trace: 'on-first-retry',
}
```
![Install Playwright](./img/install_success.png)

## 3. First Steps

The walkthrough below starts from **FR-02 (Login + lockout)** and then reuses the authenticated session for **FR-07 (Add-to-Cart)** and **FR-08 (Checkout)**. This section is the **hand-written Playwright baseline** for the seminar. The MCP/Copilot workflow is still part of the project, but it belongs to the AI comparison track and is described separately in the note below.

*Team note: verify every selector against the real EShop markup using `npx playwright codegen`. EShop does not currently expose `data-testid` hooks for the main flows, and the login inputs are not wired to accessible labels, so Codegen may fall back to positional `getByRole('textbox').nth(n)` locators rather than `getByLabel()`.*

1. Get EShop running locally first (Section 2).
2. Rather than guessing selectors, record a starting point:
   `npx playwright codegen http://localhost:5173`
3. Click through the login form inside the recorder; it suggests locators live as you interact.
4. Move the generated steps into `tests/login.spec.js`.
5. Swap out brittle CSS/XPath locators for the most stable locator available in the current markup: role, text, label, or test ID.
6. Shape the test around Arrange–Act–Assert. Because the login inputs are not linked to accessible labels in the current EShop markup, Codegen may fall back to positional `getByRole('textbox').first()` and `.nth(1)` locators rather than `getByLabel()`.
   ```js
   test.describe('FR-02: Login', () => {

     test('valid credentials log the user in', async ({ page }) => {
       await page.goto('/');
       await page.getByRole('link', { name: 'Đăng nhập' }).click();
       await page.getByRole('textbox').first().fill('test@eshop.com');
       await page.getByRole('textbox').nth(1).fill('Test1234!');
       await page.getByRole('button', { name: 'Sign In' }).click();
       await expect(page.getByRole('link', { name: 'Đăng nhập' })).not.toBeVisible();
     });

     test('invalid credentials show an error message', async ({ page }) => {
       await page.goto('/');
       await page.getByRole('link', { name: 'Đăng nhập' }).click();
       await page.getByRole('textbox').first().fill('23jadwj@gmail.com');
       await page.getByRole('textbox').nth(1).fill('123123232');
       await page.getByRole('button', { name: 'Sign In' }).click();
       await expect(page.getByText('Đăng nhập thất bại. Vui lòng kiểm tra lại.')).toBeVisible();
     });

   });
   ```
7. Run just this spec: `npx playwright test tests/login.spec.js`.
8. Re-run with `--headed` once to visually confirm it is clicking the right things, not just passing by accident.
9. Add a lockout case for repeated bad logins if the current backend seed supports it, and assert on the lockout message.
10. Refactor the login cases into a parameterised test if that keeps the assertions clearer.
11. Reuse the same authenticated state for FR-07 and FR-08 if you want the flow to stay focused on cart and checkout behaviour rather than re-testing login every time.
12. Run across browsers when needed: `npx playwright test --project=chromium --project=firefox`.
13. Check the report: `npx playwright show-report`.
14. Commit the spec and any test fixtures/data.
15. Note the run outcome (pass/fail, browser, duration) in `docs/team-log.md`.

**If you are reproducing the seminar's AI comparison track:** keep the baseline spec above, then open Copilot Agent Mode with the Playwright MCP server and let the agent draft or repair a separate version of the same flow from live browser state. Do not mix the MCP flow into the baseline checklist, because the seminar compares the two approaches side by side.

## 4. Advanced Usage

**Config file.** `playwright.config.js` keeps shared settings out of individual specs:

```js
export default defineConfig({
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  use: {
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
});
```

**Choosing locators.** Playwright's own guidance ranks locators roughly: role-based (`getByRole`) first, then text/label, then an explicit `data-testid`, with CSS/XPath as a fallback only. The reasoning: role- and label-based locators mirror what an actual user perceives on the page, so they tend to survive markup churn that would break a brittle selector chain.

**Running in parallel.** By default, Playwright's test runner spreads spec files across parallel workers. This starts to matter once flakiness measurement (WAT-13) needs many repeated runs — `--workers` controls how much concurrency to allow, which matters on a shared or resource-constrained CI runner.

**Reusing a login session.** Instead of logging in inside every single test, Playwright can save a signed-in browser state once (`storageState`) and reuse it. Faster suite, and one less place for the login flow itself to introduce flakiness into unrelated tests.

**When something fails.** `--debug` opens the Playwright Inspector for step-by-step execution. For failures that don't reproduce locally — usually CI-only — the trace viewer (`npx playwright show-trace`) replays DOM snapshots, network activity, and console output from the failed run, which is normally the fastest way in.

**AI-grounded workflow.** For the seminar's AI track, use Copilot Agent Mode together with Playwright MCP rather than repository context alone. That is the configuration that grounds generated locators in the live page and avoids hallucinated selectors such as `#cart-badge`.

## 5. Troubleshooting

| Error we hit | Root cause | How we fixed it |
|---|---|---|
| `Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL` when running `login.spec.js` | Test file was saved in the wrong directory (a stray `seminar/` folder instead of the `tests/` folder configured in `playwright.config.js`'s `testDir`) | Moved `login.spec.js` into `tests/`, matching `testDir: './tests'` |
| A second `playwright.config.js` was found inside `frontend-web/`, unrelated to the actual Playwright test project | Ran `npm init playwright@latest` inside `frontend-web` by mistake at some earlier point, generating a stray config + `tests/` scaffold there | Deleted `frontend-web/playwright.config.js` (and its accompanying `tests/` folder, if present) to avoid two competing configs |
|  | | |

## 6. Failure Modes

Ways this tooling can produce a misleading result rather than a clean pass/fail — sourced from official docs or vendor material, not guessed at.

**Auto-wait can hide a real problem behind a passing test.** Playwright retries web-first assertions until an element becomes visible or stable, which cuts down on flakiness — but a genuinely slow or partially-broken loading state can still end in a green test, as long as the element shows up before the timeout expires. Worth pairing functional assertions with an explicit timing check wherever load speed actually matters to the requirement.

**Self-healing locators can lock onto the wrong element without anyone noticing.** Auto-heal tools like Mabl or Testim pick the closest attribute match when the original locator breaks, rather than confirming the underlying intent still holds. A restructured or renamed element can get "healed" successfully while the test quietly stops verifying what it was originally meant to check — and the suite stays green throughout. Mabl's own docs log a confidence score per auto-heal for exactly this reason; periodically reviewing that log matters more than trusting an all-green run.

**AI-generated assertions tend to only cover what the prompt described.** Ask an AI assistant for a test from a natural-language scenario, and it will usually nail the happy path implied by that description — but negative cases (an error toast, a disabled button, a validation message) are easy to leave out unless explicitly asked for. Diffing AI-generated assertions against a hand-written checklist before merging (WAT-17) catches most of this.

**EShop's login form has no accessible labels on its inputs.** *Trigger:* running Codegen against the real login form. *Symptom:* Playwright can't produce a `getByLabel()` locator for the Email/Password fields, and falls back to positional locators (`getByRole('textbox').first()`, `.nth(1)`) instead. *Detection:* visible immediately in the Codegen output — no label-based locator is offered at all. *Mitigation:* either add `aria-label` / `<label for>` attributes to the EShop form (a frontend fix outside this team's scope), or accept the positional locator with a comment flagging it as fragile, and re-verify it whenever the form's field order changes.

**Network throttling against the Vite dev server can make navigation itself the failure, not the flow under test (WAT-13).** *Trigger:* emulating a constrained connection (CDP `Network.emulateNetworkConditions`, ~400–600ms latency / 300–500kbps) against `npm run dev`, rather than a production build. *Symptom:* `page.goto()` throws `Test timeout of Xms exceeded... navigating to ".../login", waiting until "load"` — the test never gets past its first line, before any flow-specific action runs. *Detection:* reproduced twice independently on this project — once in the WAT-13 investigation (6/6 consecutive runs failed identically at 45s) and once by the team's own `frontend-web/tests/helpers/network-throttle.js` (its header comment documents the same dev-server timeout, which is why that helper settled on a lighter "Fast 3G"-like profile instead of "Slow 3G"). *Mitigation:* point throttled tests at a production build (`vite build` + `vite preview`) instead of the dev server — dev mode serves ~90 unbundled ES module requests per page load, so per-request latency compounds across the whole module graph, whereas production ships 2 bundled files; that is what an actual throttled *user* experiences, not an artifact of the dev toolchain.

**Ambiguous locators fail loudly with a strict-mode violation, rather than silently acting on the first match (WAT-13/WAT-18).** *Trigger:* calling an action on a `getByRole`/`getByText` locator that resolves to more than one element — e.g. `page.getByRole('button', { name: 'Thêm vào giỏ' })` on the Home page, which renders one identical button per product card. *Symptom:* `Error: locator.click: Error: strict mode violation: getByRole(...) resolved to N elements`, listing every matching instance. *Detection:* reproduced directly in a diagnostic test that intentionally omits `.first()`/card-scoping (`frontend-web/metrics/raw/strict-mode-violation-repro.spec.js.txt`); also hit independently by the team in `add-to-cart.ai-audited.spec.js`, where `locator('h1').innerText()` briefly matched Home's 2 `<h1>` elements during a mid-navigation race (see `metrics/flakiness.md`, WAT-18). *Mitigation:* scope locators to a specific container before matching on text/role (`.first()`, parent scoping, or a more specific accessible name), and treat a strict-mode error as a signal to make the target unambiguous — not as a reflex to reach for `.first()` without checking why multiple matches exist (in the ai-audited case the real fix was waiting for navigation, not just accepting the first stale match).

**A test-level timeout with no headroom over the sequential baseline flakes once real concurrency is added (WAT-13).** *Trigger:* running the same throttled flow with real parallelism (`--repeat-each=10 --workers=10` on an 8-core machine) against one shared backend process (single Node event loop, single `sqlite3` connection) — CPU-contended Chromium instances plus backend request queuing pushed total run time from a tight ~6.4–7.3s (sequential, 0/10 flakes) to a 7.8–11.6s spread. *Symptom:* `Error: Test timeout of 10000ms exceeded` — not tied to any specific assertion; the whole test is killed once elapsed time crosses the configured limit. *Detection:* reproduced and quantified in `metrics/flakiness.md` (WAT-13): 0/10 flake rate sequential vs 5/10 flake rate under 10-way concurrency, identical throttle profile and timeout. *Mitigation:* size timeouts against the *concurrent* p95, not the sequential one (≥3x the observed tail); cap parallel workers at or below the logical core count for throttled/CPU-heavy suites; reduce shared-backend contention directly (connection pooling / WAL mode) if concurrent throttled runs are part of the standard CI profile.

## 7. References

- Playwright Team — *Best Practices*, official Playwright documentation. https://playwright.dev/docs/best-practices
- Playwright Team — *Test Agents*, official Playwright documentation. https://playwright.dev/docs/test-agents
- Microsoft — *playwright-mcp*, official repository. https://github.com/microsoft/playwright-mcp
- Bach, J. (1999) — *Test Automation Snake Oil*, v2.1, Satisfice, Inc. https://www.satisfice.com/download/test-automation-snake-oil
- mabl — *How Auto-Heal Works*, mabl Help Center. https://help.mabl.com/hc/en-us/articles/19078583792404-How-auto-heal-works
- Selenium Project — *Locator Strategies: Relative Locators*, official Selenium documentation. https://www.selenium.dev/documentation/webdriver/elements/locators/
