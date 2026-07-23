# Seminar Report — T02: Web Automation Testing

**CS423/CSC15003 Software Testing · 2026 AI-First · Seminar Track**
**Team:** Group 07
- 23127108 — Lê Hữu Minh Quang
- 23127307 — Nguyễn Phạm Minh Thư *(Team Lead)*
- 23127364 — Đặng Nguyễn Thành Hiếu
- 23127393 — Nguyễn Đăng Khoa

**Software Under Test (SUT):** [EShop](https://github.com/ttbhanh/eshop-sut/tree/main) (React + Node.js/Express)
**Companion deliverables:** `Tool_Survey_Proposal.md` (S1) · `User_Guide.md` (S4) · [`Demo_Screencast.mp4`](https://youtu.be/6GxK0aGMqVY) (S4) · `Activity_Worksheet.md` (S5) · `metrics/flakiness.md` (S3)
**Claim discipline:** every statement is anchored either in cited official documentation or in an experiment the team reproduced itself — the latter are always marked *"in our study" / "in our experiment."*

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Part I — Theory of Web Automation Testing](#part-i--theory-of-web-automation-testing)
   - [2. What Web Automation Testing Is, and Where It Sits](#2-what-web-automation-testing-is-and-where-it-sits)
   - [3. How Browser Automation Works Under the Hood](#3-how-browser-automation-works-under-the-hood)
   - [4. The Locator Problem](#4-the-locator-problem--the-heart-of-ui-test-fragility)
   - [5. Flakiness — The Defining Quality Attribute](#5-flakiness--the-defining-quality-attribute)
   - [6. The Oracle Problem and the AI-Augmented Direction](#6-the-oracle-problem-and-the-ai-augmented-direction)
   - [7. Maintenance Economics](#7-maintenance-economics--the-metric-that-decides-tool-choice)
3. [Part II — Tool Survey & Selection](#part-ii--tool-survey--selection)
   - [8. Candidate Tools](#8-candidate-tools)
   - [9. Comparison Matrix](#9-comparison-matrix)
   - [10. Pick + Rationale](#10-pick--rationale)
4. [Part III — Demo Tool Details](#part-iii--demo-tool-details)
   - [11. Playwright](#11-playwright-traditional-track--primary)
   - [12. Playwright MCP Server](#12-playwright-mcp-server-ai-track--the-grounding-layer)
   - [13. Playwright Test Agents](#13-playwright-test-agents--planner-generator-healer-ai-track--the-workflow-layer)
   - [14. GitHub Copilot](#14-github-copilot-ai-track--the-driver)
   - [15. Backup Tools](#15-backup-tools-surveyed-held-in-reserve)
5. [Part IV — Setup & Installation](#part-iv--setup--installation)
6. [Part V — Demo Scenario / Live Seminar Script](#part-v--demo-scenario--live-seminar-script)
   - [16. Live Demo Walkthrough](#16-live-demo-walkthrough-0100-20)
   - [17. In-Class Activity — Locator Brawl](#17-in-class-activity--locator-brawl-0200-40)
   - [18. Q&A and Contingency Planning](#18-qa-and-contingency-planning)
7. [Part VI — Failure Modes (Reproduced by the Team)](#part-vi--failure-modes-reproduced-by-the-team)
8. [Part VII — Synthesis, Recommendation & Conclusion](#part-vii--synthesis-recommendation--conclusion)
9. [AI Disclosure](#9-ai-disclosure)
10. [References](#10-references)

---

## 1. Project Overview

Most of what a user does on EShop happens inside a browser tab: signing in, browsing products, adding to cart, paying. Of EShop's 22 functional requirements, a large share live entirely at that browser layer, and re-checking them by hand after every commit stops scaling once the codebase grows — this is the gap web automation testing closes.

This report combines the team's full body of work for Topic **T02 — Web Automation Testing** into a single reference: the underlying theory, the tool survey that led to our pick, the internals of the tools we used, the live-seminar demo script, and the failure modes we reproduced ourselves rather than took on faith. The three flows automated throughout are:

What follows is intentionally more detailed than a slide summary. The goal is not only to list the chosen tools, but to explain why those tools fit the SUT, how the team used them in practice, and what we learned when the automation failed.

- **FR-02** — Login, including the lockout path
- **FR-07** — Add-to-Cart
- **FR-08** — Checkout

These chain into a single revenue-critical user journey, chosen deliberately over broader, shallower coverage — depth over breadth, in line with the course brief's emphasis on maintainability and flake-resistance rather than raw pass counts.

---

## Part I — Theory of Web Automation Testing

### 2. What Web Automation Testing Is, and Where It Sits

Web automation testing programmatically drives a browser the way a user would — navigating, clicking, typing, submitting — and asserts that the observable outcome matches an expected result. It sits at the top of the classical test pyramid: below it are unit tests (fast, isolated, cheap) and integration/API tests (verifying contracts without a UI); above it there is nothing but manual exploratory testing. It is also the most expensive layer per test, since each test drags along an entire browser, a rendering engine, a network stack, and the full application state.

That cost structure drives the field's central design tension. End-to-end (E2E) browser tests deliver the highest-fidelity evidence — "a user can actually check out" — but are slow, environment-sensitive, and fragile. The pyramid's advice is therefore not "write no E2E tests" but "write few, high-value E2E tests over critical user journeys, and push everything else down a layer." Our project applies exactly this principle: from EShop's 22 functional requirements we automated three flows that chain into one journey (FR-02, FR-07, FR-08), and invested the saved effort into *measuring* their maintainability and flake-resistance rather than expanding coverage.

For the seminar, this distinction matters because it explains the rest of the report. If the audience understands why E2E tests are expensive, why they are still worth having, and why only a small number should be automated, the later discussion about locators, flakiness, and AI-generated tests becomes much easier to evaluate.

### 3. How Browser Automation Works Under the Hood

All modern frameworks solve the same problem — controlling a browser from code — through three architectural generations:

| Generation | Representative tool | Mechanism | Strengths | Costs |
|---|---|---|---|---|
| 1 — WebDriver protocol | Selenium | Test process speaks HTTP to a per-browser driver binary (chromedriver, geckodriver) | Standardised, universal browser coverage | Extra process hop per command, driver-version management, request/response model limits continuous observation |
| 2 — In-browser execution | Cypress | Test code runs inside the browser, same event loop as the app | Intimate app view, automatic DOM-change waiting, time-travel debugging, great DX | Same-origin restrictions, historically limited multi-tab/multi-browser support, Chrome-family centred |
| 3 — Native protocol control | Playwright | Talks directly to the browser's own debugging protocol (CDP for Chromium, equivalents for Firefox/WebKit) over a persistent connection | No driver binary/HTTP hop; auto-waiting assertions subscribing to page state; first-class network interception/throttling; storage-state reuse; rich traces | — |

A fourth layer sits on top of these rather than beside them: **AI-augmented automation** (§6) — it does not replace the browser-control layer, it changes *who writes and maintains* the code driving it.

The practical consequence of this evolution is that newer frameworks do not just make tests shorter; they change the debugging model. Selenium tends to force the tester to reason through polling and explicit waits, Cypress gives a very tight browser-in-browser feedback loop, and Playwright exposes enough browser state that test code can behave more like a synchronous description of user intent.

### 4. The Locator Problem — the Heart of UI Test Fragility

Every UI test repeatedly answers the same question: *which element do I mean?* The answer — a **locator** — is where most maintenance cost is born, because locators couple the test to application structure, and structure changes constantly. Locator strategies form a stability spectrum:

- **Structural locators** (CSS chains, XPath) — address elements by DOM position (`div.grid > div:nth-child(1) h2`). Easy to generate mechanically (record-and-playback, naive codegen gravitate here), but encode incidental structure: a harmless refactor that wraps a component in one extra `<div>` breaks every structural locator through it. Shortness is often mistaken for robustness — a short XPath is not a stable XPath.
- **Semantic / user-facing locators** — address elements by what the *user* perceives: ARIA role (`getByRole('button', { name: 'Sign In' })`), associated label (`getByLabel`), or visible text (`getByText`). These survive DOM refactors because they change only when the actual user experience changes — exactly when a test *should* need updating. They also carry an accessibility side-benefit: a page supporting role-/label-based locators is, by construction, more accessible.
- **Dedicated test hooks** (`data-testid`, `getByTestId`) — attributes added purely for testing. The most stable hooks available, immune to styling refactors and copy changes, at the cost of requiring write access to the app code and no accessibility benefit. Playwright's docs position these as the fallback when user-facing locators are insufficient or ambiguous, not the universal first choice.

**Resulting priority order: role → label → visible text → test ID → CSS → XPath.** This is the single most transferable piece of theory in the topic, and the in-class activity ("Locator Brawl," §17) is designed to let the audience *derive* it from their own data rather than accept it on authority.

EShop makes the theory concrete: the application ships with **no `data-testid` attributes at all**, and its login form renders `<label>` and `<input>` as siblings without `htmlFor`/`id` linkage — so `getByLabel()` fails silently even though labels are visually present. This real-world condition forces every automation approach, human or AI, down the stability spectrum, and became one of the team's documented failure modes (§19).

### 5. Flakiness — the Defining Quality Attribute

A **flaky test** both passes and fails against the same code. Flakiness is widely considered the biggest pain point of UI automation because it corrodes the one thing a test suite exists to provide: trust in the signal. A suite that cries wolf gets retried, then ignored, then deleted.

The dominant root cause is **timing** — the test races the application: data arrives over the network, frameworks batch DOM updates, animations delay interactability. The classical anti-pattern is the hard sleep (`waitForTimeout(3000)`) — simultaneously too long (wastes time on fast runs) and too short (flakes on slow ones). The modern remedy is **auto-waiting**: assertions that subscribe to page state and retry until timeout. Playwright's web-first `expect()` re-evaluates until the condition holds, and its actions perform actionability checks (visible, stable, enabled) before interacting. The team enforces a **"no hard sleeps"** rule in the hand-written suite for exactly this reason.

Other recurring causes:
- **Shared/leaking state** — tests depending on order or residue from previous tests. EShop's cart, living purely in React state, is a miniature case study: a full page reload silently empties it, so navigation *method* becomes a correctness concern (see §16, Part A).
- **Environment variance** — network speed, machine load, browser version.
- **Genuine application nondeterminism** — race conditions in the app itself, which a flaky test *correctly* reports; suppressing it hides a real bug.

Because flakiness is probabilistic, it must be **measured, not eyeballed**. Protocol: run each flow 10 times on a network-throttled ("Slow 4G") profile, record first-run vs. 10th-run outcomes and per-run failures, compute a flake rate, and root-cause at least one observed flake. Comparing these numbers between hand-written and AI-generated suites converts a vague debate ("is AI code flakier?") into data.

This is why the report keeps referring to runs, outcomes, and reproduction steps instead of only describing the tools in the abstract. In a live seminar, a claim about reliability is persuasive only if the audience can see how the team reproduced the same behaviour more than once under the same conditions.

### 6. The Oracle Problem and the AI-Augmented Direction

An automated test has two halves: the **script** (how to drive the app) and the **oracle** (how to decide pass/fail). The oracle is the intellectually hard half — a test with a weak oracle can execute a perfect user journey and detect nothing: "the cart page loaded" passes whether or not the cart holds the right product at the right quantity. In our study this asymmetry showed up immediately in AI-generated tests: locator quality was decent, but assertion depth lagged hand-written tests — a *false-negative factory*, green runs that verify little.

AI-augmented web testing splits into three capability families:

1. **Test generation.** The critical distinction is **grounding**. An LLM assistant without browser access (plain GitHub Copilot) generates from *repository context* — open files, workspace, surrounding code — and can infer plausible-but-absent structures. In our study, a repo-context run invented a selector for `#cart-badge`, an element that exists nowhere in EShop but exists in most e-commerce sites the model has seen. A *grounded* generator — connected to a live browser via the Model Context Protocol (§12) — derives locators from snapshots of the actual rendered page and cannot hallucinate elements it never observed.
2. **Self-healing.** Automatically repairing tests when the application changes. Implementations differ — Testim's ML attribute-weight model re-ranks element attributes; Playwright's healer agent re-runs a failing test with browser access and edits it; Mabl combines DOM analysis with visual comparison — but they share one risk class: **a repair can mask a defect**. If the application is wrong and the test correctly fails, an automatic repair that makes it pass converts a detected bug into an undetected one. **In our experiment**, Playwright's healer, given a test failing on EShop's genuine 2-click add-to-cart bug, made the test pass **by clicking twice** — encoding the defect into a green test (full account in §19). Per its documentation the healer may instead mark a test skipped when it believes the functionality itself is broken; the outcome is not guaranteed either way, which is precisely why every heal needs human review.
3. **Triage and analysis** — summarising failures, clustering flakes, suggesting root causes. Out of scope for this demo, but it completes the taxonomy for the recommendation memo.

The theoretical through-line, older than any of these tools, is James Bach's 1999 warning in *"Test Automation Snake-Oil"*: automation does not automate *testing* (a cognitive act of evaluation); it automates *checking* (mechanical comparison against an oracle). Every AI capability above accelerates checking. None of them supplies judgment — and self-healing, used carelessly, actively removes it. This is the thesis the live demo argues with evidence.

In other words, AI can draft a script or suggest a repair, but the team still has to decide whether the repair preserves the requirement. That is why the demo script deliberately includes one case where the healer makes a test green while the underlying product bug remains unresolved.

### 7. Maintenance Economics — the Metric That Decides Tool Choice

The lifetime cost of a UI suite is dominated not by authoring but by **maintenance**: every UI change taxes every test that touches it. This reframes tool evaluation — "how fast can I write a test?" (where AI generation shines) matters less than "how often do tests break, how long does a repair take, and how trustworthy is the repaired test?" The study captures both sides: authoring time per flow *and* flake rate, invented-selector count, weak-assertion count, and healer outcomes (repaired vs. skipped) — recorded in `metrics/flakiness.md` and presented in the seminar debrief (§20). The recommendation memo (§20) is derived from these measurements, not from tool marketing.

---

## Part II — Tool Survey & Selection

*(Stage S1 deliverable — full version in `Tool_Survey_Proposal.md`)*

### 8. Candidate Tools

- **Traditional:** Playwright *(main)* · Cypress *(backup)* · Selenium 4 *(considered)*
- **AI-augmented:** GitHub Copilot Agent Mode + Playwright MCP *(main — agentic test generation + Healer self-healing)* · Testim Community *(backup AI)* · Mabl *(considered, dropped — no ongoing free tier, only a 14-day trial, which conflicts with the 3-week project schedule)*

### 9. Comparison Matrix

| Criterion | Playwright | Cypress (backup) | Selenium 4 | Copilot + Playwright MCP | Testim Community (backup) |
|---|---|---|---|---|---|
| **Licence cost** | Free, OSS (Apache 2.0) | App free (MIT); Cloud free ≈500 results/mo | Free, OSS | MCP server free & OSS (Microsoft); Copilot Free ≈50 chat req/mo, Student plan if verified before the Apr 2026 sign-up pause | Free plan ≈1,000 runs/mo, Chrome-only |
| **Learning curve** | Low: codegen + trace-viewer | Very low, best DX | Highest | Low setup (VS Code ≥1.99 built-in MCP, one-click config, Node 18+); real skill is prompt-budgeting + auditing agent output | Low: codeless recorder |
| **EShop fit** | Multi-browser + network throttling → flakiness milestone | OK, Chrome-family limits | OK, slow authoring | Agent drives a real browser on EShop, reads the accessibility tree, emits Playwright specs → fits the study milestones directly | Record FR-02, mutate DOM |
| **AI capability** | None (baseline) | None (baseline) | None (baseline) | Agentic loop Planner → Generator → **Healer** (self-healing); locators grounded in live page state, not guessed from code | Smart Locators (attribute-weight ML) |
| **Community** | Very large, Microsoft-backed | Large, mature | Largest legacy | First-party Microsoft/GitHub docs; documented failure modes (mis-clicks on ambiguous buttons, skipped state-dependent steps) | Smaller (Tricentis) |

### 10. Pick + Rationale

**Playwright (traditional) + GitHub Copilot Agent Mode with Playwright MCP (AI).**

- **Zero licence cost, one coherent stack.** The MCP server is official Microsoft OSS, and the AI output is plain Playwright TypeScript committed to the repo — tests survive even if Copilot access ends, and there is no trial-expiry cliff (the reason Mabl was eliminated).
- **Covers both required AI angles in one workflow.** MCP-grounded generation satisfies "rewrite one flow with an AI tool"; the Healer agent satisfies the "self-healing locator" objective via the brief's permitted "Copilot-suggested locator strategy" alternative — so both the traditional and the AI feature are demonstrated live inside a single session.
- **Strongest teaching contrast.** The same FR-07 flow can be shown three ways — hand-written vs. Copilot-only (guessing DOM) vs. Copilot+MCP (reading the real accessibility tree) — which directly powers the "Locator Brawl" activity and the assertion-diff milestone.

**Risk & mitigation:** Copilot Free caps chat/agent usage and agent sessions consume requests quickly, so the team (1) relies on members already verified on the GitHub Student plan (new sign-ups paused since Apr 2026), (2) batches scenarios per agent session, and (3) keeps Testim Community (free, no expiry) as the fallback.

---

## Part III — Demo Tool Details

### 11. Playwright (traditional track — primary)

**What it is.** An open-source (Apache 2.0), Microsoft-backed browser automation framework driving Chromium, Firefox, and WebKit through native debugging protocols. First-class TypeScript/JavaScript bindings (matching EShop's React frontend), plus Python, Java, and .NET.

**Architecture.** A persistent connection from the Node test runner to each browser instance; browser *contexts* provide cheap, isolated incognito-like profiles per test, enabling parallelism without cross-test state leaks. No driver binaries to version-manage.

**Features load-bearing for this project:**
- **Auto-waiting actions & web-first assertions** — every action performs actionability checks; every `expect()` retries until pass or timeout. Backbone of the "no hard sleeps" rule and the main defence against timing flakiness.
- **Locator engine** — `getByRole`, `getByLabel`, `getByText`, `getByTestId` implement the user-facing priority order of §4 directly in the API.
- **Codegen** — `npx playwright codegen` records interactions into draft test code; used for orientation, then locators were rewritten by hand (recorded output tends toward structural selectors).
- **Trace viewer** — with `trace: 'retain-on-failure'`, every failed run yields a time-travel trace (per-action DOM snapshots, console, network) — the demo Part A showpiece.
- **Network throttling & emulation** — powers the 10-run throttled flakiness protocol without external proxies.
- **Config as code** — `playwright.config.js` pins `baseURL`, restricts to Chromium for authoring (Firefox added for cross-browser flakiness comparison), and uses `webServer` to auto-start the Vite dev server.

**Known limitations hit.** No native management of an out-of-repo backend process (manual seeding documented as a prerequisite); WebKit on Linux lab machines needs extra system dependencies; codegen's structural locators must not be mistaken for best practice.

**Why it won.** Against Selenium: comparable coverage, far less boilerplate, better debugging loop for a 3-week timeline. Against Cypress: genuine multi-browser support and network throttling, both required by the study milestones. Cost: fully free.

For the report, Playwright is not presented as a generic “best tool” answer. It is presented as the best fit for this particular SUT, schedule, and seminar objective: one code-based framework for the traditional track, one consistent debugging story, and enough browser control to demonstrate flake resistance in a way the class can inspect.

### 12. Playwright MCP Server (AI track — the grounding layer)

**What it is.** The official Model Context Protocol server for Playwright, maintained by the Playwright team (`microsoft/playwright-mcp`; npm `@playwright/mcp`), open source. MCP lets an AI agent call external *tools*; this server exposes a real browser as those tools — navigate, click, type, and crucially **snapshot**, which returns a structured accessibility-tree representation of the current page.

**Why it matters.** It converts test generation from an act of *recall* (what do pages like this usually contain?) into an act of *observation* (what does this page actually contain?). The agent's loop — act, snapshot, decide, act — grounds every generated locator in rendered reality, directly remedying the invented-selector failure mode (§19), and biases generated locators toward role- and text-based forms.

**Setup used in this project.** Node.js 18+; VS Code ≥1.99 (built-in MCP support); `.vscode/mcp.json` registering `npx @playwright/mcp@latest`. Client-agnostic by design — the same server serves Copilot agent mode, Claude, or Cursor.

The important seminar point is that MCP changes the source of truth for generation. Without MCP, the model is guessing from repository context and prior patterns; with MCP, it can inspect the actual rendered page and derive locators from what is really there.

### 13. Playwright Test Agents — planner, generator, healer (AI track — the workflow layer)

Three official agent definitions shipped with Playwright v1.56+ (`playwright.dev/docs/test-agents`), installed with `npx playwright init-agents`. Each is a scoped instruction-plus-MCP-tools package executed by an external AI loop (VS Code/Copilot agent mode in this setup). They are **Playwright features, not Copilot features** — Copilot is merely the chosen driver.

- **🎭 planner** — explores the running application through the browser and produces a human-readable Markdown test plan (`specs/*.md`), seeded with login/setup context so exploration starts authenticated. The plan is a reviewable artefact before any code exists.
- **🎭 generator** — transforms an approved plan into executable Playwright specs, replaying steps in the live browser and verifying each locator resolves before committing it. Output is plain Playwright TypeScript in the team's repository — tests outlive any AI subscription.
- **🎭 healer** — takes a failing test, re-runs it with browser access, inspects traces/snapshots, and either repairs it until it passes or marks it skipped if it concludes the functionality itself is broken. **In the team's experiment, the healer repaired *around* a real defect** (the 2-click bug) rather than flagging it — see §19.

**Operational notes.** Agent definitions should be regenerated after Playwright upgrades. Generation sessions take one to a few minutes per flow and consume request quota quickly (§14). Generated assertion depth lagged hand-written oracles and was strengthened manually.

That last point is important for the audience: even when the AI gets the interaction flow right, the human still has to review whether the assertions are strong enough to prove the requirement.

### 14. GitHub Copilot (AI track — the driver)

**What it is.** GitHub's AI assistant, used here in **agent mode** inside VS Code as the LLM loop driving the MCP server and the test agents — and also, deliberately *without* MCP, as the contrast condition demonstrating ungrounded generation (§6).

**Cost and access.** Copilot Free provides limited monthly completions and chat/agent requests (exact numbers change and are not quoted here). New sign-ups for the paid individual and Student plans have been paused since April 2026; members verified before the pause retain access. This shaped the plan: each member's GitHub Education status was audited in Sprint 1, verified accounts were prioritised for agent sessions, scenarios were batched per session, planner output was reused rather than regenerated, and Claude/Cursor were kept as drop-in alternative drivers — possible only because MCP is client-agnostic.

**Behavioural observations.** Without MCP: fluent, plausible, and unmoored — the `#cart-badge` invention. With MCP: locators grounded and largely role/text-based, but assertions still shallower than hand-written oracles.

That contrast is one of the central arguments of the seminar: browser grounding improves locator quality, but it does not automatically solve the oracle problem.

### 15. Backup Tools (Surveyed, Held in Reserve)

- **Cypress (traditional backup).** MIT-licensed, in-browser execution, excellent DX; Cypress Cloud adds a paid service with a small free tier. Held as backup because the study milestones lean on multi-browser flakiness comparison and network throttling, where Playwright fits more directly.
- **Testim Community (AI backup).** Tricentis-owned codeless platform; Smart Locators use an ML attribute-weight model — self-healing by locator redundancy, mechanistically different from Playwright's re-run-and-edit healer but in the same risk class. Free Community plan (Chrome-focused, capped monthly runs, no expiry) makes it a safe fallback if the primary AI track is blocked by quota.
- **Mabl (surveyed, dropped).** GenAI-flavoured auto-healing combined with visual comparison — pedagogically interesting because pairing healing with an independent visual signal directly mitigates the masking risk. Dropped on cost grounds: as of the survey, Mabl offers only a 14-day trial with no ongoing free tier, which cannot span a 3-week project. Its self-healing blog post remains a cited reference.

---

## Part IV — Setup & Installation

*(Expanded from `User_Guide.md` §2 and aligned with the current seminar workflow)*

**Prerequisites:** Node.js v22.17.1 (or compatible), npm, Git, Windows 11 (team's tested OS).

**1. Backend server**
```bash
cd backend
npm install
node database.js   # first run only — initializes & seeds the DB
node server.js      # serves http://localhost:3000 — keep this terminal open
```

**2. Frontend web**
```bash
cd frontend-web
npm install
npm run dev          # serves http://localhost:5173
```
Confirm EShop responds in a browser at `http://localhost:5173` before writing any tests — a test failing because the SUT itself isn't up looks identical to a real bug.

**3. Installing Playwright**
```bash
npm init playwright@latest
```
Choices made: JavaScript, default `tests/` folder, GitHub Actions workflow optional, browsers installed (Chromium, Firefox, WebKit).

```bash
npx playwright test   # sanity check — bundled sample test should pass on all browsers
```

**4. Wiring Playwright to EShop** — in `playwright.config.js`:
```js
use: {
  baseURL: 'http://localhost:5173',
  trace: 'on-first-retry',
}
```

**5. AI tooling setup** — `.vscode/mcp.json` registering `npx @playwright/mcp@latest`; VS Code ≥1.99 (≥1.105 recommended for the full agentic experience); agent definitions generated via `npx playwright init-agents` (regenerate after any Playwright upgrade).

---

## Part V — Demo Scenario / Live Seminar Script

 **Recorded walkthrough:** [Demo_Screencast.mp4](https://youtu.be/6GxK0aGMqVY) — covers Part A (traditional Playwright), Part B (Copilot with/without MCP), and Part C (the healing trap) described below.

**Claim discipline for the live session:** every result is phrased "in our experiment / in our runs," never "the AI does X." Every tool-capability claim is anchored to official docs.

**Roles:** M2 = Presenter · M1 = Demoer · M3 = Facilitator · M4 = Timekeeper. Slide deck ≤15 slides.

| Block | Time | Content | Lead |
|---|---|---|---|
| 1 — Pitch | 0:00–0:10 | Why web automation, the tool landscape, the AI pick, when these tools fail | M2 |
| 2 — Live demo | 0:10–0:20 | Traditional Playwright → AI generation (with/without MCP) → the healing trap | M1, M2 |
| 3 — Audience activity | 0:20–0:40 | "Locator Brawl" hands-on exercise | M3 |
| 4 — Debrief + Q&A | 0:40–0:45 | Numbers, recommendation memo, Q&A | M2 |

### 16. Live Demo Walkthrough (0:10–0:20)

**Setup (pre-staged):** backend seeded and running; Vite dev server up; VS Code with the repo open; `.vscode/mcp.json` configured; agent definitions generated; Copilot quota checked; backup recording on local disk (used only if the live environment dies). Before the actual coding starts, the presenter should remind the class that the app is already in a known-good state, because a broken local environment can look exactly like a broken test.

**Part A — Traditional Playwright (0:10–0:14).** `add-to-cart.spec.js`, written by hand, is walked through live: login → click through to cart (never `page.goto`, since EShop's cart lives only in React state and a full reload wipes it) → assertion on exact row count, product name, and quantity. Run with `npx playwright test add-to-cart --headed` → passes. The trace viewer is then opened on a pre-saved failing trace to show the time-travel debugging workflow. The point of this part is to show that a good traditional test is not only “green”; it is also readable, deterministic, and strong enough to detect the exact product and quantity that matter.

**Part B — AI generation: repository context vs. live browser (0:14–0:18).** Copilot Agent Mode is prompted: *"Open localhost:5173, log in as test@eshop.com, add the first product to the cart, verify the cart page shows it. Then write a Playwright test for this."* For contrast, the same prompt without MCP access (repository context only) is shown to have produced a selector for a `#cart-badge` element that does not exist anywhere in EShop — plausible, confident, wrong. The MCP-grounded run does not make that mistake, because it derives locators from live-page snapshots. The generated test's locators are decent (role-/text-based), but its assertion only checks that the cart page loaded — a weaker oracle than the hand-written version, illustrating the false-negative-factory risk from §6. This is the best place in the seminar to ask the audience what the test actually proves, because the code looks tidy even when the oracle is weak.

**Part C — The healing trap (0:18–0:20), the "money moment."** EShop's product-detail page has a real bug: the first click on "Add to cart" does nothing — it takes two clicks. A hand-written test through that page correctly fails. That failing test is handed to Playwright's healer agent. Per its docs, the healer either repairs the test or marks it skipped if it believes the functionality itself is broken. **In the team's experiment, it made the test pass by clicking twice** — a green test, with the bug still present; the repair encoded the defect into the test. This outcome is not guaranteed (the healer can instead flag the functionality as broken, the "good" outcome) — which is exactly the point: whether a heal masks a bug or exposes one is decided in code review, by a human reading the diff. **Never auto-merge a heal.** At this moment in the live demo, the seminar should pause and let the audience absorb the difference between “the test passes” and “the product is correct.”

### 17. In-Class Activity — Locator Brawl (0:20–0:40)

Same target flow (login → add to cart → assert the cart). Odd-numbered teams write it **by hand** in Playwright; even-numbered teams use **Copilot or Claude** to generate it, then run and fix what breaks. 7 minutes to a running test, then 3 runs on a throttled "Slow 4G" profile, recording pass/fail and any broken locator per run. The session closes with a whiteboard tally (hand vs. AI: pass rates, broken locators, invented selectors) and a class-derived "good locator" rubric, anchored back to Playwright's own priority order (role → label → text → test ID → CSS/XPath).

The facilitator should keep the instructions concrete: do not ask the teams to write an abstract locator list; ask them to build a test that actually runs, then note exactly which locator survived the run and which one became fragile.

**Three takeaways delivered:** (1) AI-generated locators are not automatically robust when the page lacks semantic attributes; (2) user-facing locators first, test IDs as the stable fallback — per Playwright's own best-practices docs; (3) automatic healing reduces noise but can mask real defects — pair it with human review of every diff.

### 18. Q&A and Contingency Planning

Selected prepared answers:
- *"Why not Selenium?"* — Its ecosystem is the widest, but the team optimised for a 3-week timeline; Playwright's codegen and trace viewer cut authoring/debugging time. For a legacy enterprise stack, Selenium remains a defensible pick.
- *"Does this replace manual testers?"* — It replaces typing, not judgment; the healing experiment is exactly what happens without a human oracle.
- *"What does the AI cost?"* — The MCP server and agent definitions are open source; Copilot's free plan has usage limits, budgeted for by batching sessions and reusing the planner's plan file.
- *"Would Testim or Mabl show the same masking problem?"* — Different mechanism, same risk class; any automatic repair can hide a defect.

**Key contingencies:** network dies mid-demo → switch to backup recording, disclosed explicitly; Copilot quota exhausted → narrate from a saved agent transcript, disclosed as such; healer flags/skips instead of masking on the live run → pivot to a saved masking diff from earlier runs, same lesson either way.

If the audience pushes on scope, the safest answer is to restate the study boundary: this project compares one traditional framework and one AI-augmented workflow on one SUT, over three user journeys. It does not claim universal superiority across all web apps.

---

## Part VI — Failure Modes (Reproduced by the Team)

Ways this tooling can produce a misleading result rather than a clean pass/fail — each sourced from official docs *or* an experiment the team reproduced itself, not guessed at:

1. **Auto-wait can hide a real problem behind a passing test.** Playwright retries web-first assertions until an element becomes visible or stable — which cuts down on flakiness, but a genuinely slow or partially-broken loading state can still end in a green test as long as the element shows up before the timeout expires. Worth pairing functional assertions with an explicit timing check wherever load speed matters to the requirement.

2. **Self-healing can repair around a real defect instead of exposing it.** In the team's own experiment (§16, Part C), Playwright's healer agent was given a test that correctly failed on EShop's genuine 2-click add-to-cart bug, and repaired it by clicking twice — producing a green test that no longer detects the bug. The same risk class applies to other auto-heal mechanisms (Testim's attribute-weight re-ranking, Mabl's DOM+visual healing): each picks a way to keep the test passing without confirming the underlying user-facing behaviour still holds. Mitigation: every heal is a code-review event, never an auto-merge; Mabl's own docs log a per-heal confidence score for the same reason, and periodically reviewing that log matters more than trusting an all-green run.

3. **AI-generated assertions tend to only cover what the prompt described.** Asking an AI assistant for a test from a natural-language scenario usually nails the happy path implied by that description, but negative cases (an error toast, a disabled button, a validation message) are easy to leave out unless explicitly requested. Diffing AI-generated assertions against a hand-written checklist before merging catches most of this.

4. **EShop's login form has no accessible labels on its inputs.** *Trigger:* running Codegen against the real login form. *Symptom:* Playwright cannot produce a `getByLabel()` locator for the Email/Password fields and falls back to positional locators (`getByRole('textbox').first()`, `.nth(1)`). *Detection:* visible immediately in the Codegen output — no label-based locator is offered at all. *Mitigation:* add `aria-label`/`<label for>` attributes to the EShop form (outside this team's scope), or accept the positional locator with a comment flagging it as fragile, re-verified whenever the form's field order changes.

5. **Network throttling against the Vite dev server can make navigation itself the failure, not the flow under test.** *Trigger:* emulating a constrained connection (CDP `Network.emulateNetworkConditions`, ~400–600ms latency / 300–500kbps) against `npm run dev` rather than a production build. *Symptom:* `page.goto()` throws `Test timeout of Xms exceeded... waiting until "load"` before any flow-specific action even runs. *Detection:* reproduced twice independently — once in the WAT-13 investigation (6/6 runs failed identically at 45s) and once by the team's own `network-throttle.js` helper (its header comment records the same dev-server timeout, which is why it uses a lighter "Fast 3G"-like profile). *Mitigation:* throttle-test against a production build (`vite build` + `vite preview`) instead of the dev server — dev mode's ~90 unbundled module requests per load compound per-request latency in a way a bundled production app never would.

6. **Ambiguous locators fail loudly with a strict-mode violation, rather than silently acting on the first match.** *Trigger:* an action on a `getByRole`/`getByText` locator resolving to more than one element — e.g. `getByRole('button', { name: 'Thêm vào giỏ' })` on Home, which renders one identical button per product card. *Symptom:* `Error: locator.click: Error: strict mode violation: getByRole(...) resolved to N elements`. *Detection:* reproduced directly in a diagnostic test omitting `.first()`/card-scoping; also hit independently in `add-to-cart.ai-audited.spec.js`, where `locator('h1').innerText()` briefly matched Home's 2 `<h1>` elements mid-navigation (§16 discusses the fix). *Mitigation:* scope locators to a specific container rather than reaching for `.first()` reflexively — in the ai-audited case the real fix was waiting for navigation, not just accepting the first stale match.

7. **A test-level timeout with no headroom over the sequential baseline flakes once real concurrency is added.** *Trigger:* running the same throttled flow with real parallelism (`--repeat-each=10 --workers=10` on an 8-core machine) against one shared backend process — CPU-contended Chromium instances plus single-connection backend request queuing pushed total run time from a tight ~6.4–7.3s (sequential) to a 7.8–11.6s spread. *Symptom:* `Error: Test timeout of 10000ms exceeded`, not tied to any specific assertion. *Detection:* quantified in `frontend-web/metrics/flakiness-concurrency.md` (WAT-13): 0/10 flake rate sequential vs 5/10 under 10-way concurrency, identical throttle and timeout. *Mitigation:* size timeouts against the concurrent p95 (≥3x the observed tail), not the sequential one; cap parallel workers at or below the logical core count for throttled suites.

---

## Part VII — Synthesis, Recommendation & Conclusion

| Theory | Where the tooling answers it |
|---|---|
| Test pyramid: few, high-value E2E flows | 3 chained EShop flows; effort redirected into measurement |
| Locator stability spectrum | Playwright's user-facing locator API; MCP grounding biasing AI output toward role/text; activity rubric |
| Flakiness as a measurable attribute | Auto-waiting + no-sleep rule; context throttling; 10-run protocol in `metrics/flakiness.md` |
| Oracle problem / weak AI assertions | Side-by-side assertion diffs, hand vs. generated; human-strengthened oracles |
| Grounded vs. ungrounded generation | Copilot-with-MCP vs. Copilot-without-MCP contrast (`#cart-badge`) |
| Healing can mask defects | Healer vs. 2-click-bug experiment; every-heal-is-a-code-review rule |
| Checking ≠ testing (Bach) | Recommendation memo: agents draft and propose; humans decide and merge |

**Debrief numbers (from the 3-week study):** hand-written tests took **[X] min per flow** to author, with a **[Y]% flake rate** over 10 throttled runs; AI-generated tests reached a first draft in **[X′] min**, but needed **[Z] invented selectors** and **[N] weak assertions** repaired by hand. *(Exact figures recorded in `metrics/flakiness.md`.)*

**Recommendation for an EShop dev team:** Playwright with user-facing locators plus test-IDs as the foundation; use the AI agents to draft and to propose repairs — never to merge; treat every heal as a code review.

**Conclusion.** Modern web automation is converging on a stack where a traditional framework (Playwright) provides the deterministic execution and measurement substrate, and AI layers (MCP-grounded agents) compress the *clerical* portions of authoring and repair. What the AI layers do not compress — and, in the case of unreviewed healing, can actively erode — is the oracle: the human judgment about what *correct* means. The team's measurements, reproduced failure modes, and live demo all point at the same operating rule: **ground the agent in the real application, and review every generated or healed line before it merges.**

---

## 9. AI Disclosure

The team used **Claude (Anthropic)** to run web searches and draft comparison material, theory sections, and this consolidated report. Every claim was manually cross-checked against official or first-party pages before inclusion — notably `github.com/microsoft/playwright-mcp` and the Microsoft developer blog (MCP server OSS status, agent workflow), GitHub Docs and `github.com/features/copilot/plans` (Copilot Free limits, the April 2026 pause on new Student/Pro sign-ups), `mabl.com/pricing` (14-day trial, no free tier), and Testim's plan pages. Claims not verifiable on an official page were removed or marked as third-party estimates in the team log. Full prompt/outcome disclosure lives in the [AI-02] audit pack.

## 10. References

- Playwright Team — *Best Practices*, official Playwright documentation. `playwright.dev/docs/best-practices`
- Playwright Team — *Test Agents*, official Playwright documentation. `playwright.dev/docs/test-agents`
- Microsoft — *playwright-mcp*, official repository. `github.com/microsoft/playwright-mcp`
- GitHub — *Copilot Plans*. `github.com/features/copilot/plans`
- Bach, J. (1999) — *Test Automation Snake Oil*, v2.1, Satisfice, Inc. `satisfice.com/download/test-automation-snake-oil`
- mabl — *How Auto-Heal Works*, mabl Help Center. `help.mabl.com/hc/en-us/articles/19078583792404-How-auto-heal-works`
- mabl — *Pricing*. `mabl.com/pricing`
- Selenium Project — *Locator Strategies: Relative Locators*, official Selenium documentation. `selenium.dev/documentation/webdriver/elements/locators`

---

*End of Seminar Report — T02 Web Automation Testing, Group 07.*