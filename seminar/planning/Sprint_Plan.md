# Kế hoạch 3 Sprint — Seminar T02: Web Automation Testing

**CS423/CSC15003 Software Testing · 2026 AI-First · Team 4 thành viên**

SUT: **EShop** · Tool chính: **Playwright** (traditional) + **GitHub Copilot/Cursor + Testim trial** (AI-augmented)
3 flows tự động hóa: **FR-02 Login + lockout · FR-07 Add-to-Cart · FR-08 Checkout**

---

## 0. Phân vai team (cố định suốt 3 sprint)

| Key    | Vai trò Jira                  | Vai trò seminar (S6) | Trách nhiệm chính                                           |
| ------ | ----------------------------- | -------------------- | ----------------------------------------------------------- |
| **M1** | Tech Lead — Traditional track | **Demoer**           | Playwright setup, 3 flows, flakiness metrics                |
| **M2** | AI Track Owner                | **Presenter**        | Copilot/Testim experiments, so sánh locator, AI audit       |
| **M3** | Docs Owner                    | **Facilitator**      | User_Guide.md, screencast, pre-share Moodle                 |
| **M4** | PM / QA của team              | **Timekeeper**       | Proposal, worksheet, slides, tracking deadline, peer review |

> Quy tắc từ briefing: **mọi thành viên phải tự demo được tool** — pair-programming được khuyến khích nhưng không được ỷ lại vào 1 người.

**Quy ước ticket:** `WAT-xx` · Story Point (SP) theo Fibonacci · DoD chung ở cuối file.

---

## 🏁 SPRINT 1 (Tuần 1) — Claim, Proposal, Setup & First Test

**Sprint Goal:** Proposal được APPROVED (S1–S2) + Playwright chạy end-to-end 1 flow trên EShop (S3-M1, M2).
**Capacity:** ~26 SP

### Epic E1 — Tool Survey & Proposal (Stage S1–S2) — rubric 10%

| ID     | Ticket                                                                            | Assignee | SP  | Deliverable / Acceptance Criteria                                                                                                                                                                                                                           |
| ------ | --------------------------------------------------------------------------------- | -------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WAT-01 | Khảo sát 3+ candidate tools (Playwright, Cypress/Selenium 4, Copilot/Testim/Mabl) | M2       | 3   | Bảng ghi chú so sánh raw: licence, learning curve, EShop fit, AI capability, community — **có nguồn trích dẫn cho từng dòng**                                                                                                                               |
| WAT-02 | Viết `Tool_Survey_Proposal.md` (≤ 1 trang)                                        | M4       | 3   | Đủ 5 mục bắt buộc: topic code T02, ≥3 candidates (1 traditional + 1 AI + 1 backup), comparison matrix 5 tiêu chí, pick + 3-bullet rationale, **AI Disclosure** (dùng AI nào, cross-check gì). Dùng Template 1 trong slide 9 để draft, sau đó audit thủ công |
| WAT-03 | Nộp proposal Moodle trước **Sat 23:59** + theo dõi verdict S2                     | M4       | 1   | Proposal đã post; nếu MINOR-CHANGE → sửa trong ≤ 24h; scope được lock                                                                                                                                                                                       |

### Epic E2 — Environment & First Test (Stage S3: milestone M1–M2)

| ID     | Ticket                                                                                                                                      | Assignee | SP  | Deliverable / Acceptance Criteria                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --- | ------------------------------------------------------------------------------------------------------------------------- |
| WAT-04 | Dựng EShop SUT local (docker/npm) + tài liệu setup                                                                                          | M1       | 3   | EShop chạy được trên máy **cả 4 thành viên**; ghi chú lỗi setup vào team log                                              |
| WAT-05 | Cài Playwright + npm, pass official "hello world" (S3-M1)                                                                                   | M1       | 2   | `npx playwright test` xanh; codegen + trace-viewer đã thử; screenshot lưu team log                                        |
| WAT-06 | Viết test FR-02 Login + lockout (parameterised) — flow #1 end-to-end (S3-M2)                                                                | M1       | 5   | Test pass trên chromium + firefox; parameterised theo learning objective; locator dùng `data-test-id` làm baseline        |
| WAT-07 | Setup repo Git + cấu trúc thư mục deliverables + team log template                                                                          | M4       | 2   | Repo có `/tests`, `/docs`, `/metrics`, `/activity`; team log ghi: screenshot, command line, errors (yêu cầu S3)           |
| WAT-08 | Đăng ký trial: Testim AI + xác nhận Copilot/Cursor hoạt động                                                                                | M2       | 2   | Account free-tier hoạt động; chạy được 1 recording đơn giản trên EShop; ghi nhận giới hạn free tier                       |
| WAT-09 | Spike: đọc reading list (Playwright Best Practices, Bach "Test Automation Snake-Oil", Mabl self-healing post, Selenium 4 relative locators) | M3       | 3   | Tóm tắt 1 trang/nguồn vào team log — dùng làm References section (7) của User Guide                                       |
| WAT-10 | Draft khung `User_Guide.md` — 7 section headers + mục Introduction                                                                          | M3       | 2   | Skeleton đủ 7 mục: Introduction, Installation, First Test, Advanced Usage, Troubleshooting, **Failure Modes**, References |

**Sprint 1 Review checklist:** ✅ APPROVED verdict · ✅ EShop + Playwright chạy trên 4 máy · ✅ FR-02 test xanh · ✅ repo + log chuẩn.

---

## 🏁 SPRINT 2 (Tuần 2) — Deep Study, AI Experiments & Metrics

**Sprint Goal:** Hoàn thành S3 (milestone M3–M5 của brief): 3 flows, flakiness data, AI vs hand-written comparison. Bắt đầu S4.
**Capacity:** ~28 SP

### Epic E3 — Coverage 3 Flows & Flakiness (Stage S3) — rubric "Depth of study" 15%

| ID     | Ticket                                                                         | Assignee | SP  | Deliverable / Acceptance Criteria                                                                                                           |
| ------ | ------------------------------------------------------------------------------ | -------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| WAT-11 | Test FR-07 Add-to-Cart (flow #2)                                               | M1       | 3   | Test end-to-end: login → add to cart → assert badge; pass ổn định                                                                           |
| WAT-12 | Test FR-08 Checkout (flow #3)                                                  | M1       | 3   | Test end-to-end; xử lý test data (user, sản phẩm) reproducible                                                                              |
| WAT-13 | Đo flakiness: 10 runs/flow trên môi trường network-throttled; điều tra 1 flake | M1 + M4  | 5   | File `metrics/flakiness.md`: bảng first-run vs 10th-run, flake rate %, setup time, run time (S3-M5); root-cause analysis cho 1 flake cụ thể |
| WAT-14 | Ghi nhận **3 failure modes thực tế** của Playwright quan sát được (S3-M3)      | M1 + M3  | 3   | Mỗi mode có: trigger, symptom, detection, mitigation (format Template 2) — **không bịa, chỉ mode đã tái hiện hoặc có trong docs/GH issues** |

### Epic E4 — AI Track (Stage S3: M4–M5 của brief)

| ID     | Ticket                                                                    | Assignee | SP  | Deliverable / Acceptance Criteria                                                                                   |
| ------ | ------------------------------------------------------------------------- | -------- | --- | ------------------------------------------------------------------------------------------------------------------- |
| WAT-15 | Rewrite flow Add-to-Cart bằng Copilot/Cursor từ natural-language scenario | M2       | 5   | Script AI-generated được lưu **nguyên bản** + bản đã audit/refactor; log prompt dùng cho [AI-02]                    |
| WAT-16 | Self-healing locator experiment với Testim trial trên FR-02               | M2       | 3   | So sánh locator Testim (attribute-weight) vs `data-test-id`; thử 1 DOM change nhỏ và ghi kết quả heal/mask          |
| WAT-17 | Diff assertions AI-generated vs hand-written — tìm false negatives        | M2       | 3   | Bảng so sánh side-by-side; ≥ 1 ví dụ AI assertion sai/thiếu edge case (chuẩn bị làm ví dụ minute-paper như slide 8) |
| WAT-18 | Chạy 3 lần AI-version trên slow network → so flakiness với hand-written   | M2       | 2   | Bổ sung cột AI vào `metrics/flakiness.md`; kết luận sơ bộ về maintenance cost                                       |

### Epic E5 — Docs bắt đầu (Stage S4) — rubric "User-guide" 20%

| ID     | Ticket                                                                                                   | Assignee | SP  | Deliverable / Acceptance Criteria                                                                                                                      |
| ------ | -------------------------------------------------------------------------------------------------------- | -------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| WAT-19 | Viết sections 2–3: Installation (exact commands, OS notes, ≥1 screenshot) + First Test (EShop ≤ 15 bước) | M3       | 3   | Một bạn ngoài team (hoặc M4 trên máy sạch) reproduce được First Test theo đúng guide                                                                   |
| WAT-20 | Draft `Activity_Worksheet.md` — "Locator Brawl" theo timeline 25 phút trong brief                        | M4       | 3   | Time-boxed steps (0:00–0:25 như bảng section 7), worksheet + **answer key**, khả thi **offline sau setup ban đầu**; dùng Template 3 để draft rồi audit |

**Sprint 2 Review checklist:** ✅ 3 flows xanh · ✅ metrics đủ (traditional + AI) · ✅ 3 failure modes có bằng chứng · ✅ Install + First Test guide reproduce được.

---

## 🏁 SPRINT 3 (Tuần 3) — Finalize, Pre-share, Live Seminar & AI Audit

**Sprint Goal:** Nộp đủ S4–S5 đúng hạn (**pre-share ≥ 3 ngày làm việc trước seminar**), chạy S6 live 45 phút, hoàn tất S7–S8.
**Capacity:** ~27 SP

### Epic E6 — Hoàn thiện S4: User Guide + Screencast

| ID     | Ticket                                                                                                                                     | Assignee              | SP  | Deliverable / Acceptance Criteria                                                                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WAT-21 | Hoàn thành sections 4–7: Advanced Usage (config, parallel, trace), Troubleshooting (≥3 lỗi thật + fix), **Failure Modes (≥3)**, References | M3                    | 5   | Đủ 7 sections; mọi lỗi trong Troubleshooting lấy từ team log thật; mọi claim có nguồn; AI Disclosure ghi rõ trong guide — **tuyệt đối không copy-paste AI output chưa edit** (pitfall #1) |
| WAT-22 | Quay `Demo_Screencast.mp4`                                                                                                                 | M1 (quay) + M3 (dựng) | 5   | 5–8 phút (firm), 1080p, ≤ 100 MB, English narration, không nhạc nền, terminal/IDE thật; nội dung: 1 feature Playwright **và** 1 feature AI (rule of pairing)                              |
| WAT-23 | Review chéo toàn bộ guide + worksheet (internal QA)                                                                                        | Cả 4                  | 2   | M4 chạy worksheet đúng 25 phút bấm giờ (pitfall #5); M2 fact-check mọi claim AI                                                                                                           |

### Epic E7 — S5 Pre-share + S6 Live Seminar — rubric demo 15% + activity 20% + Q&A 10%

| ID     | Ticket                                                                            | Assignee | SP  | Deliverable / Acceptance Criteria                                                                                                               |
| ------ | --------------------------------------------------------------------------------- | -------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| WAT-24 | Làm `Seminar_Slides.pptx` (≤ 15 slides, dùng template lớp)                        | M2 + M4  | 3   | Cấu trúc theo S6: pitch 10' (why/who/when it fails), demo cue, activity brief, debrief; slide là phụ — activity là trung tâm                    |
| WAT-25 | **Push Moodle pre-share: Guide + Screencast + Worksheet + Slides**                | M3       | 1   | ⚠️ Hard deadline: **≥ 3 ngày làm việc trước seminar**; post Moodle kèm link folder                                                              |
| WAT-26 | Dry-run seminar 45 phút full-team ×2 lần                                          | Cả 4     | 3   | Bấm giờ đúng khung 10-10-20-5; **backup recording** sẵn phòng rớt mạng; mỗi người demo được tool độc lập; chuẩn bị đáp án cho 5 câu Q&A dự kiến |
| WAT-27 | In worksheet giấy + cheat-sheet 1 trang cho audience                              | M4       | 1   | Đủ bản in cho các team không có laptop; cheat-sheet: lệnh Playwright cốt lõi + rubric "good locator"                                            |
| WAT-28 | **Chạy live seminar S6** (Presenter M2, Demoer M1, Facilitator M3, Timekeeper M4) | Cả 4     | 3   | Demo live cả traditional **và** AI (pitfall #2, #4 — không pre-record); activity xong trong 20–25'; thu minute papers                           |

### Epic E8 — S7 + S8: Feedback & AI Audit — rubric 10%

| ID     | Ticket                                                                                      | Assignee      | SP  | Deliverable / Acceptance Criteria                                                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------- | ------------- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WAT-29 | Tổng hợp `Audience_Feedback_Aggregated.md` từ minute papers                                 | M3            | 2   | Aggregate (a) learned, (b) unclear, (c) rating; nêu 2 action items                                                                                                           |
| WAT-30 | `[AI-02]` AI Audit Report — 5 sections, ≥ 600 words                                         | M2            | 3   | Điền **trực tiếp vào template** ở `Homeworks/AI Templates/_En/` (không paraphrase); log prompt từ WAT-15/16/17 là nguyên liệu chính; dùng Template 4 để tự audit artefact AI |
| WAT-31 | `[AI-03]` Disclosure PDF ký tên ×4 + `[AI-04]` Reflective 300 words + `Final_Reflection.md` | Cả 4 (M4 gom) | 2   | Ký tên thật từng người; nộp trong **≤ 5 ngày làm việc sau seminar** (pitfall #6: thiếu disclosure = auto-penalty)                                                            |
| WAT-32 | `Peer_Review.md` cho 2 team partner                                                         | M1 + M4       | 2   | ≥3 strengths + ≥3 suggestions gắn với section cụ thể + 1 câu hỏi audience dự kiến; không viết kiểu "great work, nothing to add"                                              |

---

## Ma trận Rubric ↔ Ticket (đảm bảo không hụt điểm)

| Rubric (20% môn học)            | Weight | Tickets cover      |
| ------------------------------- | ------ | ------------------ |
| Tool survey + proposal          | 10%    | WAT-01→03          |
| Depth of study                  | 15%    | WAT-06, 11→18      |
| User-guide document             | 20%    | WAT-10, 19, 21, 23 |
| Live demo on EShop              | 15%    | WAT-22, 26, 28     |
| In-class hands-on activity      | 20%    | WAT-20, 23, 27, 28 |
| Q&A + facilitation              | 10%    | WAT-26, 28         |
| AI Audit + Disclosure + Reflect | 10%    | WAT-30, 31         |

## Guard-rails — 6 auto-penalty pitfalls → ticket chặn

1. Copy-paste AI chưa edit → WAT-21, WAT-23 (QA chéo bắt buộc)
2. Demo thiếu 1 trong 2 vế traditional/AI → WAT-22, WAT-28 (AC ghi rõ rule of pairing)
3. Thiếu Failure Modes → WAT-14 + WAT-21 (section riêng, có bằng chứng)
4. Pre-record demo "live" → WAT-26 (backup recording chỉ dùng khi rớt mạng, demo chính là live)
5. Worksheet > 25 phút → WAT-23 (dry-run bấm giờ)
6. Thiếu AI Disclosure / [AI-02] rỗng → WAT-30, WAT-31 (log prompt được thu từ Sprint 2)

## Definition of Done (áp dụng mọi ticket)

- Artefact commit vào repo đúng thư mục, có người thứ 2 review.
- Mọi claim/số liệu có nguồn hoặc bằng chứng (screenshot, log, metrics file).
- Nội dung AI-generated đã được human edit + ghi vào prompt log cho [AI-02].
- Deadline cứng: **S1 Sat W-claim 23:59 · S5 ≥ 3 ngày trước seminar · S8 ≤ 5 ngày sau seminar.**
