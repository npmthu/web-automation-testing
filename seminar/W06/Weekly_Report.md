# Weekly Report — W06

## General Information

- **Group ID:** 07
- **Group Name:** Group 07
- **Project Name:** T02 — Web Automation Testing (SUT: EShop)
- **Date range:** 2026-07-13 – 2026-07-18 (Monday – Saturday)

## Tasks Completed This Week

### 23127307 – Nguyễn Phạm Minh Thư

- Finished `User_Guide.md`/`Seminar_Report.md` §6 Failure Modes and finalized the flakiness-metrics tables (`WAT-21`, partial).
- Built `Seminar_Slides.pptx` (≤15 slides) (`WAT-24`).
- Assembled and packaged the final submission bundle — Documentation, Diagrams, Test Scripts, Task Management, Slides and Video Demo — into `W06/07.zip`.
- **Evidence:** commits "docs: add failure modes to report and user guide", "update: add flakiness metrics"; `docs/team-log.md` §WAT-24 (slide link); `W06/07.zip` (`07/Slides and Video Demo/T02_Seminar_Slides.pptx`, `07/Documentation/Seminar_Report.md`).

### 23127364 – Đặng Nguyễn Thành Hiếu

- Completed `User_Guide.md` §3 First Steps and general team-log clean-up as part of the Sprint 3 documentation push.
- Edited the `Demo_Screencast` recording into the final video (`WAT-22`, joint with Khoa).
- **Evidence:** `docs/User_Guide.md` §3; `W06/07.zip` (`07/Slides and Video Demo/Link Youtube Video Demo.docx` → https://youtu.be/6GxK0aGMqVY).

### 23127393 – Nguyễn Đăng Khoa

- Recorded the demo footage for `Demo_Screencast.mp4` (`WAT-22`, joint with Hiếu): one Playwright feature (hand-written Add-to-Cart + trace viewer) and one AI feature (Copilot/Claude + Playwright MCP generation and the healer "masking" experiment), per the pairing rule.
- **Evidence:** `W06/07.zip` (`07/Slides and Video Demo/Link Youtube Video Demo.docx`); `W05/Demo_Script.md` (the script the recording follows).

### Whole team

- Ran the live 45-minute seminar (pitch → live demo → "Locator Brawl" audience activity → debrief/Q&A) following `W05/Demo_Script.md`, and published the recording/slide links (`WAT-28`).
- **Evidence:** `W06/07.zip` (demo video + slide links); `W05/Activity_Worksheet.md` + `Answer_key.md` (the activity run).

## AI Usage Declaration

- **Tool:** GitHub Copilot Agent Mode / Claude, as disclosed throughout `User_Guide.md` and `Seminar_Report.md` — no new AI-assisted testing artifact was produced this week beyond finalizing and disclosing the Sprint 2 AI-track results (`WAT-15`–`WAT-18`) inside the User Guide and Report; all AI-generated content referenced there was human-audited before inclusion (per `WAT-21`'s acceptance criteria: "tuyệt đối không copy-paste AI output chưa edit").
- **Tool:** Claude Code (Anthropic), CLI.
- **Purpose:** used this week to help compile these three `Weekly_Report.md` files (W04/W05/W06) by reading and cross-referencing the team's own existing artifacts — `planning/Sprint_Plan.md`, `docs/team-log.md`, `submission/tests/ai-track/prompt-log.md`, `Tool_Survey_Proposal.md`, and the files inside `W06/07.zip`.
- **What AI generated:** the draft text and formatting of the three weekly reports.
- **What was verified:** every task, evidence path, and date claim was cross-checked against real files/commits in the repo before being written down; no results were invented (consistent with the project's own "claim discipline" convention in `Seminar_Report.md`). This report itself should be read over by the team before submission.
- **Used by:** Nguyễn Phạm Minh Thư.

Link: https://drive.google.com/file/d/1l6bO6fog1eM6K4_10oMshg5GawmEkr_o/view?usp=sharing

## Tasks Planned for Next Week

- `WAT-29` Aggregate `Audience_Feedback_Aggregated.md` from the minute papers collected at the live seminar.
- `WAT-30` `[AI-02]` AI Audit Report (5 sections, ≥600 words), using `prompt-log.md` and `assertions-diff.md` as primary source material.
- `WAT-31` `[AI-03]` AI Disclosure PDF (signed by all 4 members) + `[AI-04]` Reflective Statement (300 words) + `Final_Reflection.md` — due within 5 working days of the live seminar.
- `WAT-32` `Peer_Review.md` for the two assigned peer-review partner teams.

## Issues

- **None of the Stage-S8 deliverables exist yet** (`Audience_Feedback_Aggregated.md`, `[AI-02]` audit, `[AI-03]` disclosure PDF, `[AI-04]`/`Final_Reflection.md`, `Peer_Review.md`) — all are due within 5 working days after the live seminar. `Sprint_Plan.md`'s own guard-rail list flags a missing AI Disclosure as an automatic penalty, so this is the top priority for next week.
- **`WAT-16` (Testim self-healing experiment) was never completed across all 3 sprints** — no Testim trial account was ever obtained (blocked since `WAT-08` in W04). This should be named explicitly as a scope limitation in the `[AI-02]` Audit Report rather than silently dropped.
- Minor process note: several `team-log.md` entries for completed work (`WAT-06`, `WAT-19`) were left as unfilled placeholders even though the underlying deliverable existed — worth a quick pass before using the log as evidence for the AI Audit report.
