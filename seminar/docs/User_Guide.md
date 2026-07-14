
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

This guide walks through how our team approached that gap for EShop, centered on **Playwright** as our main framework, with **GitHub Copilot / Cursor** layered on top as the AI-augmented half of the comparison required by the seminar. We looked at Selenium 4 and Cypress as alternatives; Playwright won out mostly because of its multi-browser support, the built-in codegen/trace-viewer tooling, and how naturally it fits a TypeScript codebase. The full reasoning behind that decision lives in `Tool_Survey_Proposal.md` from Stage S1 — this document doesn't repeat it.

A few notes on scope before diving in:

- This is not a Playwright tutorial from scratch. Official docs (linked in Section 7) already cover that ground well.
- Everything here is scoped to what actually changes, or breaks, when the target application is specifically EShop rather than a generic demo site.
- Intended readers: teammates setting up a clean environment, classmates following along during the live seminar, and anyone deciding whether Playwright + an AI assistant is a sensible combination for a project EShop's size.

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

Walkthrough below automates **FR-02 (Login)**, tied to Study Milestones M1–M2. Kept to 15 steps or fewer.

*〔Team note: verify every selector against the real EShop markup using `npx playwright codegen`. What's shown here is a template pattern using `data-testid` naming — not confirmed against actual EShop DOM yet.〕*

1. Get EShop running locally first (Section 2).
2. Rather than guessing selectors, record a starting point:
   `npx playwright codegen http://localhost:5173`
3. Click through the login form inside the recorder; it suggests locators live as you interact.
4. Move the generated steps into `tests/login.spec.js`.
5. Swap out any brittle CSS/XPath locators the recorder suggested for role- or test-id-based ones (rationale in Section 4).
6. Shape the test around Arrange–Act–Assert. Note: EShop's login inputs aren't wired to accessible labels, so Codegen fell back to positional `getByRole('textbox').nth(n)` locators rather than `getByLabel()` — see the maintainability caveat in Section 4.
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
8. Re-run with `--headed` once to visually confirm it's clicking the right things, not just passing by accident.
9. Add a second case covering **lockout** (also FR-02) — repeated bad logins should trigger a lockout message; assert on it.
10. Turn both cases into a parameterised test (valid/invalid credentials as a data table) per the Learning Objectives in the T02 brief.
11. Run across browsers: `npx playwright test --project=chromium --project=firefox`.
12. Check the report: `npx playwright show-report`.
13. Commit the spec and any test fixtures/data.
14. Note the run outcome (pass/fail, browser, duration) in `docs/team-log.md`.
15. Reuse this same pattern later for FR-07 (Add-to-Cart) and FR-08 (Checkout).

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

## 7. References

- Playwright Team — *Best Practices*, official Playwright documentation. https://playwright.dev/docs/best-practices
- Bach, J. (1999) — *Test Automation Snake Oil*, v2.1, Satisfice, Inc. https://www.satisfice.com/download/test-automation-snake-oil
- mabl — *How Auto-Heal Works*, mabl Help Center. https://help.mabl.com/hc/en-us/articles/19078583792404-How-auto-heal-works
- Selenium Project — *Locator Strategies: Relative Locators*, official Selenium documentation. https://www.selenium.dev/documentation/webdriver/elements/locators/
