# Weekly Report — W04

## General Information

- **Group ID:** 07
- **Group Name:** Group 07
- **Project Name:** T02 — Web Automation Testing (SUT: EShop)
- **Date range:** 2026-06-29 – 2026-07-04 (Monday – Saturday)

## Tasks Completed This Week

### 23127307 – Nguyễn Phạm Minh Thư

- Surveyed candidate tools (traditional: Playwright, Cypress, Selenium 4; AI-augmented: GitHub Copilot Agent Mode + Playwright MCP, Testim Community, Mabl) and drafted the 5-criterion comparison matrix (licence cost, learning curve, EShop fit, AI capability, community).
- Wrote and submitted `Tool_Survey_Proposal.md` (topic code T02, ≥3 candidates, pick + rationale, AI Disclosure section).
- Wrote `planning/Sprint_Plan.md` (3-sprint breakdown, ticket IDs `WAT-01`…`WAT-32`, role assignments, Definition of Done).
- Added `docs/` skeleton (`Seminar_Guide.docx`, `T02_Web_Automation_Testing.docx`, `team-log.md` template).
- **Evidence:** `seminar/W04/Tool_Survey_Proposal.md`; `seminar/planning/Sprint_Plan.md`; commits "docs: add Tool Survey Proposal and Sprint Plan for Web Automation Testing", "docs: add seminar guide and docs".

### 23127393 – Nguyễn Đăng Khoa

- Set up the EShop SUT locally and installed Playwright (`WAT-04`, `WAT-05`).
- Implemented the parameterised FR-02 Login + lockout end-to-end test (`WAT-06`), the team's first working flow.
- **Evidence:** commits "Add test script using Playwright for FR-02: Login" (×3); `tests/login/` spec files carried forward into `submission/tests/login/fr02-login-smoke.spec.js`.

### 23127364 – Đặng Nguyễn Thành Hiếu

- Read and summarized the four assigned reading-list sources (Playwright Best Practices, Bach's "Test Automation Snake-Oil", Mabl's self-healing explainer, Selenium 4 relative locators) for use as `User_Guide.md` References (`WAT-09`).
- Drafted the `User_Guide.md` skeleton — 7 section headers plus the Introduction (`WAT-10`).
- **Evidence:** `docs/team-log.md` §WAT-09, §WAT-10; `docs/User_Guide.md`.

> No individually-evidenced task is recorded for 23127108 – Lê Hữu Minh Quang this week; his first documented contribution appears in W05 (FR-08 checkout test).

## AI Usage Declaration

- **Tool:** Claude (Anthropic), web chat.
- **Purpose:** Research support for the tool survey — running web searches and drafting the first pass of the 5-criterion comparison matrix in `Tool_Survey_Proposal.md`.
- **What AI generated vs. what was verified:** Claude produced a draft matrix and claims about tool pricing/capabilities. The team manually cross-checked every claim against official/first-party sources before publishing: `github.com/microsoft/playwright-mcp` and the Microsoft developer blog (MCP server OSS status), GitHub Docs + `github.com/features/copilot/plans` (Copilot Free limits, Student-plan sign-up pause), `mabl.com/pricing` (14-day trial only, no free tier — this contradicted an earlier AI-drafted claim and was corrected), and Testim's plan page. Any claim that could not be verified on an official page was removed or marked as a third-party estimate.
- **Used by:** Nguyễn Phạm Minh Thư (drafting), reviewed by the team before submission.
- Full disclosure text is in `Tool_Survey_Proposal.md` §5 "AI Disclosure".

Link: https://drive.google.com/file/d/1l6bO6fog1eM6K4_10oMshg5GawmEkr_o/view?usp=sharing

## Tasks Planned for Next Week

- `WAT-11` Add-to-Cart (FR-07) end-to-end test.
- `WAT-12` Checkout (FR-08) end-to-end test with reproducible test data.
- `WAT-13` Flakiness measurement: 10 runs/flow on a network-throttled environment + root-cause one flake.
- `WAT-14` Document 3 real Playwright failure modes.
- `WAT-15`–`WAT-18` AI track: rewrite Add-to-Cart with an AI tool, self-healing locator experiment (Testim), diff AI vs. hand-written assertions, compare flakiness.
- `WAT-19` Draft User Guide §2–3 (Installation, First Test).
- `WAT-20` Draft `Activity_Worksheet.md` ("Locator Brawl").

## Issues

- **`WAT-08` (register Testim trial + confirm Copilot/Cursor) was not completed this week.** No Testim account was ever created; this was later confirmed as a blocker in Sprint 2 when `WAT-16` (self-healing locator experiment) could not proceed for the same reason. Carried forward as an open risk.
- **Documentation gap on `WAT-06`:** the test itself was implemented and passes (see evidence above), but the corresponding `team-log.md` entry was left as an unfilled placeholder rather than recording the actual command/output/locator choices. Flagged for the team to backfill so it can feed `User_Guide.md` §6/§7 later.
- **Resolved during survey:** Mabl was dropped as the AI-augmented candidate after discovering it offers only a 14-day trial with no ongoing free tier, which would have expired mid-project — this is why GitHub Copilot Agent Mode + Playwright MCP was picked instead (documented in `Tool_Survey_Proposal.md` §4).
