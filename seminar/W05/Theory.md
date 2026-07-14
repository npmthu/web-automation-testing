# Seminar Report — T02 Web Automation Testing

## Part I: Theory of Web Automation Testing · Part II: Demo Tool Details

**CS423/CSC15003 Software Testing · 2026 AI-First · Group 07**
_Companion documents: `Tool_Survey_Proposal.md` (Stage S1), `User_Guide.md` (Stage S4), `metrics/flakiness.md` (Stage S3). Claim discipline: statements are anchored either in cited documentation or in experiments we reproduced ourselves; the latter are always marked "in our study"._

---

# Part I — Theory of Web Automation Testing

## 1. What web automation testing is, and where it sits

Web automation testing is the practice of programmatically driving a web browser to exercise an application the way a user would — navigating, clicking, typing, submitting — and asserting that the observable outcome matches an expected result. It occupies the top of the classical test pyramid: below it sit unit tests (fast, isolated, cheap) and integration/API tests (verifying contracts between components without a UI); above it there is nothing but manual exploratory testing. Web UI automation is one of the most common forms of automated testing in modern software development, alongside API and unit testing, but it is also the most expensive layer per test: each test drags an entire browser, a rendering engine, a network stack, and the full application state along with it.

That cost structure explains the central design tension of the field. End-to-end (E2E) browser tests deliver the highest-fidelity evidence — "a user can actually check out" — but they are slow, environment-sensitive, and fragile. The pyramid's advice is therefore not "write no E2E tests" but "write few, high-value E2E tests over critical user journeys, and push everything else down a layer." Our project applies exactly this principle: from EShop's 22 functional requirements we automated three flows that chain into one revenue-critical journey — Login with lockout (FR-02), Add-to-Cart (FR-07), and Checkout (FR-08) — and invested the saved effort into _measuring_ their maintainability and flake-resistance rather than expanding coverage.

## 2. How browser automation works under the hood

All modern web automation frameworks solve the same problem — controlling a browser from code — but through three distinct architectural generations, and the differences explain much of their behaviour.

**Generation 1: the WebDriver protocol (Selenium).** Selenium standardised browser control as the W3C WebDriver specification: the test process speaks HTTP to a per-browser driver binary (chromedriver, geckodriver), which translates commands into browser-native actions. The strengths are standardisation and universal browser coverage; the costs are an extra process hop per command (latency), driver-version management, and a request/response model that makes it hard for the framework to _observe_ the page continuously — the test only knows what it explicitly polls for.

**Generation 2: in-browser execution (Cypress).** Cypress inverted the model by running the test code inside the browser itself, in the same event loop as the application. This gives it an intimate view of the app (automatic waiting on DOM changes, time-travel debugging) and famously good developer experience, at the price of architectural constraints: same-origin restrictions, historically limited multi-tab and multi-browser support, and a Chrome-family centre of gravity.

**Generation 3: native protocol control (Playwright).** Playwright talks directly to the browser's own debugging protocol (Chrome DevTools Protocol for Chromium, and equivalent channels for Firefox and WebKit) over a persistent connection. There is no driver binary and no HTTP hop; the framework holds a live, bidirectional channel to the browser, which enables capabilities the earlier generations struggle with: auto-waiting assertions that subscribe to page state rather than polling it, network interception and throttling as first-class features, storage-state reuse for fast authenticated sessions, and rich post-mortem artefacts (traces) recorded from inside the engine.

A fourth layer has emerged on top of these frameworks rather than beside them: **AI-augmented automation**, discussed in §5 — it does not replace the browser-control layer but changes _who writes and maintains_ the code that drives it.

## 3. The locator problem — the heart of UI test fragility

Every UI test must answer the same question hundreds of times: _which element do I mean?_ The answer — a **locator** — is where most maintenance cost is born, because locators couple the test to the application's structure, and application structure changes constantly.

Locator strategies form a stability spectrum:

**Structural locators** (CSS selector chains, XPath) address elements by their position in the DOM tree: `div.grid > div:nth-child(1) h2`. They are easy to generate mechanically — record-and-playback tools and naive code generation gravitate toward them — but they encode incidental structure. A harmless refactor that wraps a component in one extra `<div>` breaks every structural locator through it. Shortness is often mistaken for robustness here; a short XPath is not a stable XPath.

**Semantic / user-facing locators** address elements by what the _user_ perceives: their ARIA role (`getByRole('button', { name: 'Sign In' })`), their associated label (`getByLabel`), or their visible text (`getByText`). These survive DOM refactors because they change only when the actual user experience changes — which is precisely when a test _should_ need updating. Playwright's own best-practices documentation recommends prioritising these user-facing attributes, and they carry a second benefit: a page that supports role- and label-based locators is, by construction, a more accessible page.

**Dedicated test hooks** (`data-testid` and `getByTestId`) are attributes added to the application solely for testing. They are the most stable hooks available — immune to both styling refactors and copy changes — at the cost of requiring write access to the application code and providing no accessibility side benefit. Playwright's documentation positions them as the fallback when user-facing locators are insufficient or ambiguous, not as the universal first choice.

The resulting priority order — **role → label → visible text → test ID → CSS → XPath** — is the single most transferable piece of theory in this topic, and our in-class activity ("Locator Brawl") is designed to let the audience _derive_ it from their own experimental data rather than accept it on authority.

EShop makes the theory concrete. In our study, the application ships with no `data-testid` attributes at all, and its login form renders `<label>` and `<input>` as siblings without `htmlFor`/`id` linkage — so `getByLabel()` fails silently even though labels are visually present. This is a real-world condition (semantically weak markup) that forces every automation approach, human or AI, down the stability spectrum, and it became one of the documented failure modes in our user guide.

## 4. Flakiness — the defining quality attribute

A **flaky test** is one that both passes and fails against the same code. Flakiness is widely considered the biggest pain point of UI automation because it corrodes the one thing a test suite exists to provide: trust in the signal. A suite that cries wolf gets retried, then ignored, then deleted.

The dominant root cause is **timing**: the test races the application. Web apps render asynchronously — data arrives over the network, frameworks batch DOM updates, animations delay interactability — and a test that assumes an element is ready the instant a navigation completes will fail exactly as often as the network is slow. The classical (anti-)pattern is the hard sleep (`waitForTimeout(3000)`), which is simultaneously too long (waste on fast runs) and too short (flake on slow ones). The modern remedy is **auto-waiting**: assertions that subscribe to page state and retry until a timeout — Playwright's web-first `expect()` re-evaluates until the condition holds, and its actions perform actionability checks (visible, stable, enabled) before interacting. In our hand-written suite we enforce a "no hard sleeps" rule for exactly this reason.

Other recurring causes include **shared or leaking state** (tests depending on order or on residue from previous tests — our EShop cart, living purely in React state, is a miniature case study: a full page reload silently empties it, so navigation _method_ becomes a correctness concern), **environment variance** (network speed, machine load, browser version), and **genuine application nondeterminism** (race conditions in the app itself — which a flaky test is _correctly_ reporting; suppressing it hides a real bug).

Because flakiness is probabilistic, it must be _measured_, not eyeballed. Our protocol, taken from the topic brief: run each flow 10 times on a network-throttled ("Slow 4G") profile, record first-run vs 10th-run outcomes and per-run failures, compute a flake rate, and root-cause at least one observed flake. Comparing these numbers between the hand-written and AI-generated suites converts a vague debate ("is AI code flakier?") into data.

## 5. The oracle problem and the AI-augmented direction

An automated test has two halves: the **script** (how to drive the app) and the **oracle** (how to decide pass/fail — the assertions). The oracle is the intellectually hard half. A test with a weak oracle can execute a perfect user journey and still detect nothing: "the cart page loaded" passes whether or not the cart contains the right product at the right quantity. In our study, this asymmetry showed up immediately in AI-generated tests — locator quality was decent, but assertion depth lagged hand-written tests, producing what we call a _false-negative factory_: green runs that verify little.

AI-augmented web testing, the mandated second track of this topic, splits into three capability families:

**1. Test generation** — producing test code from a natural-language scenario. The critical architectural distinction is **grounding**. An LLM assistant without browser access (plain GitHub Copilot) generates from _repository context_: open files, workspace, surrounding code. It can therefore infer plausible-but-absent structures; in our study, a repo-context run invented a selector for `#cart-badge`, an element that exists nowhere in EShop but exists in most e-commerce sites the model has seen. A _grounded_ generator — one connected to a live browser via the Model Context Protocol (§8) — derives locators from snapshots of the actual rendered page and cannot hallucinate elements it never observed.

**2. Self-healing** — automatically repairing tests when the application changes. Implementations differ (Testim uses an ML attribute-weight model that re-ranks element attributes; Playwright's healer agent re-runs a failing test with browser access and edits it; Mabl combines DOM analysis with visual comparison), but they share one risk class: **a repair can mask a defect**. If the application is _wrong_ and the test correctly fails, an automatic repair that makes the test pass has converted a detected bug into an undetected one. In our experiment, Playwright's healer, given a test that failed on EShop's genuine 2-click add-to-cart bug, made the test pass by clicking twice — encoding the defect into a green test. (Per its documentation the healer may instead mark a test as skipped when it believes the functionality itself is broken; the outcome is not guaranteed either way, which is precisely why every heal must pass human review.)

**3. Triage and analysis** — summarising failures, clustering flakes, suggesting root causes. Out of scope for our demo, but it completes the taxonomy for the recommendation memo.

The theoretical through-line, older than any of these tools, is James Bach's 1999 warning in "Test Automation Snake-Oil": automation does not automate _testing_ (a cognitive act of evaluation); it automates _checking_ (mechanical comparison against an oracle). Every AI capability above accelerates checking. None of them supplies judgment — and self-healing, used carelessly, actively removes it. This is the thesis our live demo argues with evidence.

## 6. Maintenance economics — the metric that decides tool choice

The lifetime cost of a UI suite is dominated not by authoring but by maintenance: every UI change taxes every test that touches it. This reframes tool evaluation. "How fast can I write a test?" (where AI generation shines) matters less than "how often do tests break, how long does a repair take, and how trustworthy is the repaired test?" Our study therefore captures both sides: authoring time per flow _and_ flake rate, invented-selector count, weak-assertion count, and healer outcomes (repaired vs skipped) — the numbers presented in the seminar debrief and recorded in `metrics/flakiness.md`. The recommendation memo (Part II §11) is derived from these measurements, not from tool marketing.

---

# Part II — Demo Tool Details

## 7. Playwright (traditional track — primary)

**What it is.** An open-source (Apache 2.0), Microsoft-backed browser automation framework driving Chromium, Firefox, and WebKit through native debugging protocols. First-class bindings for TypeScript/JavaScript (our choice, matching EShop's React frontend), plus Python, Java, and .NET.

**Architecture in brief.** A persistent connection from the Node test runner to each browser instance; browser _contexts_ provide cheap, isolated incognito-like profiles per test, enabling parallelism without cross-test state leaks. No driver binaries to version-manage. Because the framework sits on the browser's own protocol, it can subscribe to page lifecycle events — the foundation of its auto-waiting behaviour.

**Features load-bearing for this project:**

- **Auto-waiting actions and web-first assertions.** Every action performs actionability checks; every `expect()` retries until pass or timeout. This is the mechanism behind our "no hard sleeps" rule and the main structural defence against timing flakiness (§4).
- **Locator engine.** `getByRole`, `getByLabel`, `getByText`, `getByTestId` implement the user-facing priority order of §3 directly in the API — the theory and the tool agree.
- **Codegen.** `npx playwright codegen` records interactions into draft test code. We used it for orientation, then rewrote locators by hand — recorded output tends toward structural selectors, a useful live illustration of §3.
- **Trace viewer.** With `trace: 'retain-on-failure'`, every failed run yields a time-travel trace: per-action DOM snapshots, console, network. This is our debugging workflow (and demo Part A's showpiece) — evidence replaces guessing.
- **Network throttling and emulation.** Context-level network condition control powers the 10-run throttled flakiness protocol without external proxies.
- **Config as code.** Our `playwright.config.js` pins `baseURL`, restricts to Chromium for authoring (Firefox added for the cross-browser flakiness comparison), and uses `webServer` to auto-start the Vite dev server — one command (`npx playwright test`) brings up the whole stack except the separately-seeded backend.

**Known limitations we hit.** No native management of an out-of-repo backend process (we document manual seeding as a prerequisite); WebKit coverage on Linux lab machines requires extra system dependencies; and codegen's structural locators must not be mistaken for best practice.

**Why it won the survey.** Against Selenium: comparable coverage with far less boilerplate and a materially better debugging loop for a 3-week timeline. Against Cypress: genuine multi-browser support and network throttling, both required by the study milestones. Cost: fully free — no licence risk anywhere in the plan.

## 8. Playwright MCP server (AI track — the grounding layer)

**What it is.** The official Model Context Protocol server for Playwright, maintained by the Playwright team (repository: `microsoft/playwright-mcp`; npm: `@playwright/mcp`), open source. MCP is a standard that lets an AI agent call external _tools_; this server exposes a real browser as those tools — navigate, click, type, and crucially **snapshot**, which returns a structured accessibility-tree representation of the current page.

**Why it matters theoretically.** It converts test generation from an act of _recall_ (what do pages like this usually contain?) into an act of _observation_ (what does this page actually contain?). The agent's loop — act, snapshot, decide, act — grounds every generated locator in rendered reality. This is the direct remedy for the invented-selector failure mode (§5), and the accessibility-tree basis biases generated locators toward role- and text-based forms, aligning AI output with the human best-practice order of §3.

**Setup in our project.** Node.js 18+; VS Code ≥ 1.99 (built-in MCP support); `.vscode/mcp.json` registering `npx @playwright/mcp@latest`. Client-agnostic by design: the same server serves Copilot agent mode, Claude, or Cursor — an important de-risking property given AI-plan volatility (§10).

**Scoping and safety.** The server supports capability flags and origin restrictions; in a CI or shared setting the agent should be confined to the SUT's origin. For our local, seeded EShop this is a documented note rather than an active constraint.

## 9. Playwright Test Agents — planner, generator, healer (AI track — the workflow layer)

**What they are.** Three official agent definitions shipped with Playwright v1.56+ (documented at playwright.dev/docs/test-agents), installed into a project with `npx playwright init-agents`. Each is a scoped instruction-plus-MCP-tools package executed by an external AI loop (VS Code/Copilot agent mode in our setup — VS Code v1.105+ for the full agentic experience). They are Playwright features, not Copilot features; Copilot is merely the driver we chose.

- **🎭 planner** explores the running application through the browser and produces a human-readable Markdown test plan (`specs/*.md`). A _seed spec_ provides login/setup context so exploration starts authenticated. The plan is a reviewable artefact — coverage decisions become visible before any code exists.
- **🎭 generator** transforms an approved plan into executable Playwright specs, replaying steps in the live browser and verifying that each locator resolves before committing it. Output is plain Playwright TypeScript in our repository — a durability property we weighted heavily: the tests outlive any AI subscription.
- **🎭 healer** takes a failing test, re-runs it with browser access, inspects traces and snapshots, and either repairs the test until it passes or marks it skipped if it concludes the functionality itself is broken. The healer's output is a reviewable diff — and our study's central finding (§5) is that the review is not optional: in our experiment the healer repaired _around_ a real defect (the 2-click bug), while its documented alternative behaviour (skip-as-broken) did not occur on that run. Which behaviour you get is not predictable in advance.

**Division of labour with MCP.** The MCP server (§8) is the _capability_ (a browser as tools); the agents are _policy_ (scoped roles with defined inputs and outputs). The separation gives each stage a narrow context and a reviewable artefact — plan, spec, diff — which is what makes human checkpoints practical.

**Operational notes from our study.** Agent definitions should be regenerated after Playwright upgrades (`init-agents` again). Generation sessions take one to a few minutes per flow and consume the driving assistant's request quota quickly (§10). Generated assertion depth lagged our hand-written oracles and was strengthened manually — logged for the [AI-02] audit.

## 10. GitHub Copilot (AI track — the driver)

**What it is.** GitHub's AI assistant, used here in **agent mode** inside VS Code as the LLM loop that drives the MCP server and the test agents. Also used, deliberately _without_ MCP, as our contrast condition to demonstrate ungrounded generation (§5).

**Cost and access.** Copilot Free provides limited monthly completions and chat/agent requests (exact numbers change; consult the current plans page — we avoid quoting figures that expire). The Student plan offers effectively unconstrained use, but new sign-ups for the paid individual and Student plans have been paused since April 2026; members verified before the pause retain access. This asymmetry shaped our plan: we audited each member's GitHub Education status in Sprint 1, prioritised verified accounts for agent sessions, batched scenarios per session, reused planner output rather than regenerating, and kept Claude/Cursor as drop-in alternative drivers (possible only because MCP is client-agnostic — a survey criterion that paid off).

**Behavioural observations in our study.** Without MCP: fluent, plausible, and unmoored — the `#cart-badge` invention. With MCP: locators grounded and largely role/text-based; assertions still shallow relative to hand-written oracles. Both observations are logged with prompts and outputs in the [AI-02] audit pack.

## 11. Backup tools (surveyed, held in reserve)

**Cypress (traditional backup).** MIT-licensed runner with in-browser execution (§2) and excellent DX; Cypress Cloud adds a paid service with a small free tier. Held as backup rather than primary because the study milestones lean on multi-browser flakiness comparison and network throttling, where Playwright's architecture fits more directly.

**Testim Community (AI backup).** Tricentis-owned codeless platform whose Smart Locators use an ML attribute-weight model: each element is identified by many weighted attributes, and when some change the model re-ranks the rest — self-healing by locator redundancy, mechanistically different from Playwright's re-run-and-edit healer but in the same risk class (§5). The free Community plan (Chrome-focused, capped monthly runs, no expiry) makes it a safe fallback experiment if the primary AI track is blocked by quota.

**Mabl (surveyed, dropped).** GenAI-flavoured auto-healing combined with visual comparison — pedagogically interesting because pairing healing with an independent visual signal directly mitigates the masking risk. Dropped on cost grounds: as of our survey, Mabl offers a 14-day trial with no ongoing free tier (contradicting the course brief's note), which cannot span a 3-week project. Retained in the reading list; its blog post on self-healing remains a cited reference.

## 12. Synthesis — how the tools map to the theory

| Theory (Part I)                              | Where the tooling answers it                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Test pyramid: few, high-value E2E flows (§1) | 3 chained EShop flows; effort redirected into measurement                                               |
| Locator stability spectrum (§3)              | Playwright's user-facing locator API; MCP grounding biasing AI output toward role/text; activity rubric |
| Flakiness as measurable attribute (§4)       | Auto-waiting + no-sleep rule; context throttling; 10-run protocol in `metrics/flakiness.md`             |
| Oracle problem / weak AI assertions (§5)     | Side-by-side assertion diffs, hand vs generated; human-strengthened oracles                             |
| Grounded vs ungrounded generation (§5, §8)   | Copilot-with-MCP vs Copilot-without-MCP contrast (`#cart-badge`)                                        |
| Healing can mask defects (§5, §9)            | Healer vs 2-click bug experiment; every-heal-is-a-code-review rule                                      |
| Checking ≠ testing (Bach, §5)                | Recommendation memo: agents draft and propose; humans decide and merge                                  |

The one-paragraph conclusion the report defends: modern web automation is converging on a stack where a traditional framework (Playwright) provides the deterministic execution and measurement substrate, and AI layers (MCP-grounded agents) compress the _clerical_ portions of authoring and repair. What the AI layers do not compress — and, in the case of unreviewed healing, can actively erode — is the oracle: the human judgment about what _correct_ means. Our measurements, our reproduced failure modes, and our live demo all point at the same operating rule: **ground the agent in the real application, and review every generated or healed line before it merges.**

---

_References for Part I–II are consolidated in `User_Guide.md` §7 (Playwright documentation and best practices; playwright.dev/docs/test-agents; microsoft/playwright-mcp; GitHub Copilot plans documentation; Testim documentation; Mabl pricing and self-healing blog post; Bach, J., "Test Automation Snake-Oil", 1999; Selenium 4 release notes). AI assistance in drafting this report is disclosed in [AI-02]/[AI-03]: sections were drafted with Claude from our own study artefacts and verified against the cited primary sources before submission._
