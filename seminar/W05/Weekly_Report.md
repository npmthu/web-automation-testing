# Weekly Report — W05

## General Information

- **Group ID:** 07
- **Group Name:** Group 07
- **Project Name:** T02 — Web Automation Testing (SUT: EShop)
- **Date range:** 2026-07-06 – 2026-07-11 (Monday – Saturday)

## Tasks Completed This Week

### 23127307 – Nguyễn Phạm Minh Thư

- Implemented the FR-07 Add-to-Cart end-to-end test (login → add to cart from Home → assert cart content) (`WAT-11`).
- Rewrote the Add-to-Cart flow using an AI tool from a natural-language scenario (`WAT-15`): Attempt 1 (blind code generation, no browser grounding) reproduced a real false negative; Attempt 2, using Claude Code driving a live browser through the **Playwright MCP** server, self-discovered the `ProductDetail.jsx` 2-click bug via accessibility snapshots. Saved both the verbatim AI-generated script and the human-audited version.
- Diffed AI-generated vs. hand-written assertions and identified concrete gaps (hardcoded product name, containment-only assertion) (`WAT-17`).
- Measured flakiness of the AI-audited vs. hand-written version on a throttled network, root-caused a strict-mode violation, and fixed it (`WAT-18`).
- **Evidence:** `submission/tests/cart/fr07-add-to-cart*.spec.js`; `submission/tests/ai-track/scenario.md`, `prompt-log.md`, `assertions-diff.md`, `add-to-cart.ai-generated.spec.js`, `add-to-cart.ai-audited.spec.js`; `metrics/flakiness.md` §WAT-18; `docs/team-log.md` §WAT-11/15/17/18; commits "WAT-11: add Playwright for end-to-end testing…", "WAT-15: implement AI-audited add-to-cart tests and flakiness metrics".

### 23127108 – Lê Hữu Minh Quang

- Implemented the FR-08 Checkout end-to-end test with reproducible test data (test account, clean-state web, seeded product) and verified results against the Admin dashboard (`WAT-12`).
- Drafted `Activity_Worksheet.md` for the "Locator Brawl" in-class activity, time-boxed 0:00–0:25 (`WAT-20`).
- **Evidence:** `docs/img/checkout_success.png`, `docs/img/checkout_success_2.png`; `docs/team-log.md` §WAT-12/§WAT-20; `W05/Activity_Worksheet.md`, `W05/Answer_key.md`; commit "feat(WAT-12): add Playwright for end-to-end testing and implement Checkout".

### 23127393 – Nguyễn Đăng Khoa & 23127108 – Lê Hữu Minh Quang

- Measured flakiness across 10 runs/flow on normal and network-throttled environments for FR-02/FR-07/FR-08, and root-caused the one flake found (FR-08 throttled: 2/10 = 20%, `Test timeout of 30000ms exceeded` — the `setup: login` step alone consumed ~27s of the 30s budget under throttling) (`WAT-13`).
- **Evidence:** `metrics/flakiness.md` §WAT-13; `frontend-web/tests/flakiness-sweep.spec.js`.

### 23127393 – Nguyễn Đăng Khoa & 23127364 – Đặng Nguyễn Thành Hiếu

- Documented 3 reproduced Playwright failure modes: (1) network-throttled `page.goto()` timeout on the Vite dev server, (2) unscoped locator causing a strict-mode violation, (3) test-level timeout with no margin flaking under real concurrency (`WAT-14`).
- **Evidence:** `docs/User_Guide.md` §6 (Failure Modes); `docs/team-log.md` §WAT-14.

### 23127364 – Đặng Nguyễn Thành Hiếu

- Drafted `User_Guide.md` §2–3 (Installation, First Test) (`WAT-19`).
- **Evidence:** `docs/User_Guide.md` §2 "Installation and Setup", §3 "First Steps"; `docs/img/install_success.png`.

## AI Usage Declaration

- **Tool:** Claude Code (Anthropic), driving the browser through the official **Playwright MCP server** (`browser_navigate`, `browser_snapshot`, `browser_fill_form`, `browser_click`) against the live EShop app.
- **Purpose:** `WAT-15` — regenerate the Add-to-Cart test from the plain-language scenario in `tests/ai-track/scenario.md`.
- **What AI generated:** In Attempt 2, the agent read only the scenario text plus live accessibility snapshots (no source files), performed the login → open-product → add-to-cart → check-cart flow itself, discovered on its own that a single click did not add the item (empty-cart snapshot), self-corrected to a double-click, and wrote `add-to-cart.ai-generated.spec.js` from the successful trace. Attempt 1 (kept as an audit trail, no MCP/browser access) produced a passing test that was actually a **false negative**, because blind generation never inspected the DOM.
- **What was human-audited:** After the live session, the source (`ProductDetail.jsx`) was read to explain the double-click requirement; the AI-generated script was then rewritten into `add-to-cart.ai-audited.spec.js` with 4 concrete fixes — read the product name from the DOM instead of hardcoding it, assert row count + quantity instead of just visibility, add `waitForURL` to avoid a route-transition race, and tolerate the transient "Đã thêm" button state.
- **Additional use:** the same audited/generated pair was reused for `WAT-17` (assertion diff) and `WAT-18` (flakiness comparison under throttled network).
- **Used by:** Nguyễn Phạm Minh Thư.
- Full session log: `submission/tests/ai-track/prompt-log.md`; assertion comparison: `submission/tests/ai-track/assertions-diff.md`.

Link: https://drive.google.com/file/d/1l6bO6fog1eM6K4_10oMshg5GawmEkr_o/view?usp=sharing

## Tasks Planned for Next Week

- `WAT-21` Finish `User_Guide.md` §4–7 (Advanced Usage, Troubleshooting, Failure Modes, References).
- `WAT-22` Record and edit `Demo_Screencast.mp4` (5–8 min, one Playwright feature + one AI feature).
- `WAT-23` Internal cross-review of the guide and worksheet (worksheet timed at 25 min).
- `WAT-24` Build `Seminar_Slides.pptx` (≤15 slides).
- `WAT-25` Push the pre-share package to Moodle (≥3 working days before the live seminar).
- `WAT-26` Full-team dry-run of the 45-minute seminar (×2).
- `WAT-28` Run the live seminar.

## Issues

- **`WAT-16` (Testim self-healing locator experiment) could not be done this week either** — still no Testim trial account, a carry-over blocker from `WAT-08` in W04. Logged honestly as `[ ]` rather than fabricating a result; disclosed in `prompt-log.md` and left for the AI Audit report as a known scope gap.
- **`WAT-19`'s `team-log.md` narrative entry was left as an unfilled placeholder** even though the actual Installation/First Test guide content was completed (same documentation-discipline gap seen with `WAT-06` in W04) — flagged for the team to keep the log current going forward.
- Flakiness data shows a real, non-trivial risk: FR-08 checkout hits a 20% flake rate under network throttling because the default 30s Playwright timeout leaves almost no margin once login setup alone takes ~27s under throttle — worth deciding whether to raise the timeout or optimize the login step before the live demo.
