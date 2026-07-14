# Presentation Script — T02 Web Automation Testing

**CS423/CSC15003 · 2026 AI-First · Stage S6 · rev 2 (post technical review)**
Roles: **M2 = Presenter · M1 = Demoer · M3 = Facilitator · M4 = Timekeeper**
Slide deck: ≤ 15 slides (referenced as [S#]).

> **Claim discipline (rev 2):** every result from our study is phrased "in our experiment / in our runs" — never "the AI does X". Every tool capability claim is anchored to official docs. This protects us in Q&A and satisfies the AI policy ("every public statement must be verifiable").

---

## BLOCK 1 — PITCH (0:00–0:10) · Speaker: M2

### [S1] Title (0:00–0:01)

> "Good morning everyone. We're Team 07, and for the next 45 minutes you're going to write browser tests two ways — by hand, and with an AI agent — and then decide for yourselves which one you'd trust in production. Quick roadmap: 10 minutes of context, 10 minutes of live demo, then 20 minutes where _you_ do the work, and we close with Q&A."

### [S2] Why web automation, why now (0:01–0:03)

> "Web UI automation is one of the most common forms of automated testing in modern software development — alongside API and unit testing, and with a reputation problem all of its own: **flaky tests** are widely considered one of the biggest pain points in UI automation. Tests that pass on Monday and fail on Tuesday with zero code changes.
>
> EShop — the SUT you all know — has 22 functional requirements, most touching the browser. We automated three that chain into one user journey: **Login with lockout (FR-02), Add-to-Cart (FR-07), and Checkout (FR-08)**. Not because more is better, but because the assignment isn't 'do the tests pass' — it's 'how maintainable and flake-resistant are they'. Depth over breadth."

### [S3] The tool landscape (0:03–0:05)

> "We surveyed five tools. Traditional side: Selenium — the industry standard with the widest ecosystem, but the most boilerplate. Cypress — lovely developer experience, Chrome-family focused. **Playwright** — Microsoft-backed, multi-browser, with codegen and a trace viewer. We picked Playwright.
>
> On the AI side, the brief suggested Mabl and Testim. Here's our first real finding: **as of our survey, Mabl offers only a 14-day trial — no ongoing free tier**, which would expire mid-project. Lesson one of tool surveys: vendor pricing pages beat course handouts; always re-verify. So we went a different way…"

### [S4] Our AI pick: Copilot Agent Mode + Playwright MCP (0:05–0:08)

> "…GitHub Copilot in Agent Mode, connected through the **official Playwright MCP server, maintained by the Playwright team**. Here's why this matters.
>
> Without browser grounding, Copilot generates tests from your **repository context** — open files, workspace, surrounding code — rather than observing the running application. That can produce selectors and assumptions that don't match the live UI. With MCP — Model Context Protocol — the AI **drives a real browser**: it opens EShop, takes accessibility snapshots of the actual rendered page, performs the actions, and only then writes the test. It's the difference between describing a room from the blueprints and walking through it.
>
> On top of the MCP server, Playwright v1.56 introduced **Playwright Test Agents** — three official agent definitions called planner, generator, and healer, installed with `npx playwright init-agents` and driven from your AI tool of choice: Copilot agent mode, Claude, or Cursor. The planner explores the app and writes a Markdown test plan; the generator turns the plan into spec files, verifying locators against the live page; the healer re-runs failing tests and repairs them. That last one — the healer — is where things get interesting. Hold that thought for the demo."

_(Accuracy note for the team: these three are official Playwright features — cite playwright.dev/docs/test-agents if challenged. They are NOT generic MCP concepts and NOT Copilot features; they are Playwright-provided instruction+tool definitions executed by an external AI loop. Say it that way.)_

### [S5] When these tools FAIL (0:08–0:10)

> "The rubric asks who uses a tool and **when it fails** — so before we show anything working, here's when it doesn't. Three failure modes **we reproduced ourselves in our study**, not copied from a blog:
>
> **One** — no `data-test-id`s in the app pushes everyone toward fragile locators. EShop's login form has labels that aren't programmatically linked to inputs, so even `getByLabel()` fails silently.
> **Two** — in our runs, the AI agent sometimes selected the wrong control when multiple similar elements existed on the page — and did so confidently, with no warning.
> **Three** — and this is the big one — **automatic test repair can mask real defects**. We'll show you our own experiment where an AI 'fixed' a test that _should_ have kept failing. Keep that in mind for everything you see next."

_(Handover: M2 → M1. M4 confirms 0:10.)_

---

## BLOCK 2 — LIVE DEMO (0:10–0:20) · Driver: M1, narration shared with M2

> **Setup (pre-staged):** backend seeded + running; Vite dev server up; VS Code with repo open; `.vscode/mcp.json` configured; agent definitions generated (`npx playwright init-agents`); Copilot quota checked; **backup recording on local disk** (used ONLY if the environment dies — TAs check that demos are live).
> **Rule of pairing check:** Part A = traditional feature, Parts B & C = AI features. Both shown → requirement satisfied.

### Part A — Traditional Playwright (0:10–0:14)

M1 speaks while typing:

> "This is `add-to-cart.spec.js` — written by hand. Watch three things. First, the flow: login, add the first product from the Home page, then _click_ through to the cart — not `page.goto` — because EShop's cart lives only in React state; a full page load wipes it. We learned that the hard way. Second: no `sleep()` calls anywhere — every assertion is an auto-retrying `expect()`. Third, the assertion: exactly one row, right product, quantity 1."

Run: `npx playwright test add-to-cart --headed` → passes.

> "Green. And when it's _not_ green —" open trace viewer on a pre-saved failing trace "— this is Playwright's trace viewer: every action, screenshot, and network call, time-travel style. That's feature one: the traditional tool."

### Part B — AI generation: repository context vs live browser (0:14–0:18)

M2 narrates, M1 drives:

> "Now the same flow, generated. We prompt Copilot Agent Mode: _'Open localhost:5173, log in as test@eshop.com, add the first product to the cart, verify the cart page shows it. Then write a Playwright test for this.'_
>
> Watch the chat panel — the agent is operating the browser through the MCP server: navigate, snapshot, click, snapshot again."

_(While the agent runs — ~1–2 min — M2 fills the air:)_

> "For contrast: **in our study**, when we asked Copilot for the same test _without_ MCP — working from repository context alone — it produced a selector for a `#cart-badge` element that doesn't exist anywhere in EShop. Plausible, confident, wrong: most shops have a cart badge, this one doesn't. The MCP-grounded run didn't make that mistake in our experiments, because it derives locators from snapshots of the real page. That's the grounding difference in one example."

Show generated test side-by-side with the hand-written one:

> "Its locators are decent — role- and text-based, consistent with what Playwright's docs push generators toward. But compare the assertions: ours checks row count, product name, _and_ quantity. In our run, the generated test only verified that the cart page loaded. **Passing test, weaker oracle** — a false-negative factory if merged unreviewed. Write that down; it's on your worksheet."

### Part C — The healing trap (0:18–0:20) ⭐ the money moment

> "Last one. EShop's product-detail page has a real bug: the first click on 'Add to cart' does nothing — it takes two clicks. A hand-written test through that page **fails**, and it _should_ fail. That's a test doing its job.
>
> We gave that failing test to Playwright's healer agent. Per its docs, the healer re-runs the test and either repairs it — or marks it as skipped if it believes the functionality itself is broken. So what did it do **in our experiment**?" _(run pre-staged healer session live if quota allows; otherwise show the saved transcript and say so)_ "…it made the test pass — **by clicking twice**. Green test. The bug is still there. The repair encoded the defect into the test.
>
> To be fair: that outcome isn't guaranteed — the healer _can_ flag broken functionality instead, and when it skips a test, that's it working as intended. But that's precisely the point: **whether a heal masks a bug or exposes one is decided in code review, by a human reading the diff**. Never auto-merge a heal. That's the most important sentence of this seminar."

_(Contingency: if the live healer correctly SKIPS the test instead — pivot, don't panic: "And here it actually flagged the functionality as broken — the good outcome. In our earlier runs it patched around the bug instead; here's that saved diff. Same lesson either way: the heal decision needs human review because you can't know in advance which behaviour you'll get.")_

_(Handover: M1 → M3. M4 confirms 0:20, distributes printed worksheets + cheat-sheets.)_

---

## BLOCK 3 — AUDIENCE ACTIVITY: "Locator Brawl" (0:20–0:40) · Facilitator: M3

> **Materials:** printed `Activity_Worksheet.md` + 1-page cheat-sheet (core commands + Playwright's locator priority table). Feasible offline after initial setup. M1 & M2 roam as helpers; M4 runs a visible clock.

### Briefing (0:20–0:23) — M3:

> "Your turn. Same target flow: login → add to cart → assert the cart. Odd-numbered teams: write it **by hand** in Playwright — the cheat-sheet has everything. Even-numbered teams: use **Copilot or Claude** — prompt it, run what it gives you, fix what breaks. 7 minutes to a running test. Go."

### Write phase (0:23–0:30)

M3 circulates. Standard nudges:

- Hand teams stuck on selectors → "What's the most _stable_ thing about that element: its role, its label, its text — or just where it happens to sit in the DOM?"
- AI teams with invented selectors → "Don't fix it silently. Write down _what_ it invented first — that's your data point."

### Run phase (0:30–0:35) — M3:

> "Stop writing. Run your test **3 times** — the lab machines are throttled to 'Slow 4G'. Record on the worksheet: pass/fail per run, and which locator broke, if any."

### Compare & rubric (0:35–0:40) — M3 at whiteboard:

> "Shout out your results." _(Tally: hand vs AI — pass rates, broken locators, invented selectors.)_
>
> "Now the real deliverable: a class **'good locator' rubric**. Playwright's own docs give us the starting order: **prefer user-facing locators — role, then label, then visible text — and when those aren't available or aren't unique, dedicated test IDs are the most stable automation hooks**. Raw CSS chains and XPath are the last resort. Does today's data agree? Give me two rules of your own." _(Collect: e.g., short ≠ stable; semantic locators survive redesigns better than structural ones; if you control the app code, add the test-id rather than writing a clever selector.)_
>
> "Three takeaways to keep. First: AI-generated locators are not automatically robust — when the page lacks semantic attributes, they can fall back on unstable structure, as some of you just saw. Second: user-facing locators first; test IDs as your stable fallback — that ordering comes from Playwright's own best-practices docs, not from us. Third: automatic healing reduces noise but can mask real defects — pair it with human review of every diff, or a second signal like visual comparison."

_(Handover: M3 → M2/M4. Worksheets stay with teams for the minute papers.)_

---

## BLOCK 4 — DEBRIEF + Q&A (0:40–0:45) · Lead: M2, M4 collects papers

### [S14] Debrief (0:40–0:42) — M2:

> "One slide of numbers from our 3-week study: hand-written tests — [X] min per flow to author, [Y]% flake rate over 10 throttled runs. AI-generated — [X'] min to a first draft, but [Z] invented selectors and [N] weak assertions we repaired by hand. Our recommendation memo for an EShop dev team: **Playwright with user-facing locators plus test-ids as the foundation; use the AI agents to draft and to propose repairs — never to merge; treat every heal as a code review.**"

### [S15] Q&A (0:42–0:45) — M2 fields, M1 handles technical, M4 timeboxes 45s/question.

Prepared answers:

1. **"Why not Selenium — isn't it the industry standard?"** → "It is, and its ecosystem is the widest. We optimised for a 3-week timeline: Playwright's codegen and trace viewer cut our authoring and debugging time. For a legacy enterprise stack, Selenium remains a defensible pick."
2. **"Does this replace manual testers?"** → "It replaces _typing_, not _judgment_. Everything you saw still needed a human oracle — the healing experiment is exactly what happens without one."
3. **"What does the AI cost?"** → "The MCP server and the agent definitions are open source. Copilot's free plan has usage limits that agent sessions consume quickly — the exact numbers change, so check the current plan page. We budgeted: batch scenarios per session, reuse the planner's plan file, refactor by hand. And since the agent definitions are client-agnostic, Claude or Cursor work as alternative drivers."
4. **"Would Testim or Mabl show the same masking problem?"** → "Different mechanism, same risk class. Testim stabilises locators with an ML attribute-weight model; Mabl combines DOM checks, auto-healing and visual comparison. Any automatic repair can hide a defect — Mabl pairing healing with a visual signal is the right instinct, and it's what we'd recommend regardless of tool."
5. **"Can we use this on our own project?"** → "Yes — `npx playwright init-agents`, wire up the MCP server, drive it from your AI tool. Two rules travel with it: ground the agent in the real app, and review every generated or healed line before merge."

**Off-topic redirect (rubric: humility + redirection):**

> "Good question, but it's beyond what we studied — we don't want to guess in front of you. Catch us after class or drop it on the Moodle thread and we'll follow up with sources."

**If we don't know:**

> "We don't know — we didn't test that path. Our study covered [scope]; outside it we'd be speculating."

### Closing (0:45) — M2:

> "Before you leave: one minute paper per team — one thing you learned, one thing still unclear, a 1–5 usefulness rating. Hand them to [M4]. Materials have been on Moodle since [date] — the guide's Failure Modes section documents all three traps from today, with reproduction steps. Thank you!"

---

## Appendix A — Contingency matrix

| Failure                               | Fallback                                                                                                                                                                | Owner |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Network dies mid-demo                 | Switch to backup recording; state clearly "this is our backup recording, the live env just died" (honesty > pretending — pre-recorded 'live' demos are an auto-penalty) | M1    |
| Copilot quota exhausted               | Parts B/C from saved agent transcript, narrated live; disclose it's a transcript                                                                                        | M2    |
| Healer flags/skips instead of masking | Use the pivot script in Part C — show saved masking diff from earlier runs; lesson unchanged                                                                            | M1/M2 |
| EShop backend crash                   | `node database.js && node server.js` re-seed (~30 s); M2 fills with Part B comparison talk                                                                              | M1    |
| Activity running long                 | M4 calls it at 0:35; compare phase compresses to 3 min; rubric built with 2 rules instead of 3                                                                          | M4    |
| Audience team has no laptop           | Printed worksheet paper variant: rank 6 given locators from most to least stable                                                                                        | M3    |

## Appendix B — Pre-flight checklist (morning of)

- [ ] Backend seeded, frontend dev server up, test user verified
- [ ] `npx playwright test` full pass on demo machine
- [ ] Failing trace file saved and opens in trace viewer
- [ ] Healer transcript + masking diff saved (in case live run behaves differently)
- [ ] Agent definitions regenerated after any Playwright update (`npx playwright init-agents`)
- [ ] Copilot quota sufficient on demo account (check current plan limits)
- [ ] Backup recording on local disk (not cloud)
- [ ] Worksheets ×[n teams] + cheat-sheets printed (cheat-sheet includes Playwright locator-priority table); whiteboard markers
- [ ] Slow-4G throttle profile configured on lab machines

## Appendix C — Claim register (rev 2, for [AI-02] and Q&A defence)

| Claim in script                                                                  | Status                                                           | Anchor                              |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------- |
| Playwright Test Agents (planner/generator/healer) are official, v1.56+           | Verified                                                         | playwright.dev/docs/test-agents     |
| Healer repairs failing tests OR marks them skipped if functionality seems broken | Verified                                                         | playwright.dev/docs/test-agents     |
| MCP server is official, maintained by the Playwright team                        | Verified                                                         | github.com/microsoft/playwright-mcp |
| Copilot w/o MCP works from repository context, may infer non-existent selectors  | Our experiment (`#cart-badge` case) — say "in our study"         | team log + saved transcript         |
| Healer masked the 2-click bug by clicking twice                                  | Our experiment — say "in our experiment", outcome not guaranteed | saved diff + transcript             |
| Agent mis-clicks among similar elements                                          | Our runs — say "in our runs"                                     | team log reproduction               |
| Mabl: 14-day trial only, no free tier                                            | Verified at survey time — say "as of our survey"                 | mabl.com/pricing                    |
| Copilot Free has usage limits                                                    | Verified, numbers volatile — never quote exact figures           | current plans page                  |
| Locator priority: user-facing first, test IDs when insufficient                  | Verified                                                         | Playwright best-practices docs      |
