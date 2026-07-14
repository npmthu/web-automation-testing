# Team Log — WAT (Web Automation Testing, Topic T02)

> Ghi liên tục theo ticket thật đã làm. Mỗi mục = 1 entry mới, không xoá entry cũ.
> Nội dung ở đây sẽ là nguyên liệu cho `User_Guide.md`, `metrics/flakiness.md`, và `[AI-02]` sau này —
> nên ghi đúng những gì thật sự xảy ra, không suy diễn hộ người khác.

---

## SPRINT 1

### [ ] WAT-06 — Test FR-02 Login + lockout (flow #1) — Khoa
**SP:** 5 · **Acceptance Criteria:** pass trên chromium + firefox, parameterised, locator dùng `data-test-id`

〔Khoa điền: lệnh chạy, kết quả pass/fail, locator dùng, ảnh/log〕

---

### [x] WAT-09 — Spike: đọc reading list — Hiếu
**SP:** 3 · **Acceptance Criteria:** tóm tắt 1 nguồn/đoạn, dùng làm References (mục 7) của User_Guide.md

**1. Playwright — Best Practices** (playwright.dev/docs/best-practices)
Tài liệu chính thức nhấn mạnh test isolation (mỗi test chạy độc lập, tự quản local storage/cookie riêng), ưu tiên locator theo role/text hơn là chi tiết implementation (class CSS, tên hàm...), và dùng web-first assertion (tự động chờ + retry) thay vì fixed sleep. Có codegen để tự sinh locator bằng cách click trực tiếp trên trang, và trace-viewer để debug CI failure mà không cần video/screenshot rời.

**2. Bach, J. — "Test Automation Snake Oil" (v2.1, 1999)**
Bài viết nổi tiếng của James Bach (Satisfice) phê phán các tuyên bố phóng đại của công ty bán tool automation — bài gốc viết từ 1996, tái bản 1999 vì các "lời hứa suông" đó vẫn lặp lại trong ngành đến tận bây giờ. Ý chính: automation không tự động thay thế tư duy kiểm thử của con người; công cụ chỉ là phương tiện, dễ tạo ảo tưởng an toàn nếu áp dụng không đúng ngữ cảnh.

**3. Mabl — "How Auto-Heal Works"** (help.mabl.com)
Giải thích cơ chế self-healing: Mabl thu thập nhiều thuộc tính của mỗi UI element trong lúc chạy test (bao gồm cả ancestor element và custom test-id), lưu thành "element history". Khi chạy lại, nếu không tìm thấy match mạnh, Mabl thử auto-heal dựa trên lịch sử đó — nhưng chỉ áp dụng auto-heal nâng cao sau khi test đã chạy pass ổn định ≥ 5 lần, và log rõ mức độ tự tin (confidence) của mỗi lần heal.

**4. Selenium — Relative Locators** (selenium.dev/documentation/webdriver/elements/locators)
Selenium 4 thêm 5 relative locator: `above()`, `below()`, `toLeftOf()`, `toRightOf()`, `near()` — tìm phần tử dựa theo vị trí tương đối với 1 phần tử khác đã biết, dùng khi phần tử không có id/name ổn định nhưng vị trí trên layout thì ổn định. Cơ chế dựa trên `getBoundingClientRect()` của JavaScript nên phụ thuộc vào cách trang render — dễ sai lệch nếu responsive layout đổi theo màn hình.

*→ 4 tóm tắt trên sẽ chuyển thẳng vào Section 7 References của User_Guide.md khi làm WAT-21.*

---

### [ ] WAT-10 — Draft khung User_Guide.md — Hiếu
**SP:** 2 · Đã hoàn thành riêng — xem file `User_Guide.md`, mục Introduction.

---

### [ ] WAT-11 — Test FR-07 Add-to-Cart (flow #2) — Thư
**SP:** 3 · **AC:** login → add to cart → assert badge, pass ổn định

〔Thư điền: lệnh chạy, kết quả, ảnh/log〕

---

### [ ] WAT-12 — Test FR-08 Checkout (flow #3) — Quang
**SP:** 3 · **AC:** end-to-end, test data (user, sản phẩm) reproducible

〔Quang điền: lệnh chạy, kết quả, test data dùng, ảnh/log〕

---

## SPRINT 2

### [ ] WAT-15 — Rewrite Add-to-Cart bằng Copilot/Cursor — Thư
**SP:** 5 · **AC:** lưu bản AI-generated nguyên bản + bản đã audit/refactor, log prompt cho [AI-02]

〔Thư điền: prompt đã dùng, output AI (nguyên bản), bản đã sửa, nhận xét khác biệt〕

---

### [ ] WAT-16 — Self-healing locator experiment (Testim) trên FR-02 — Thư
**SP:** 3 · **AC:** so sánh Testim locator vs `data-test-id`, thử 1 DOM change nhỏ, ghi kết quả heal/mask

〔Thư điền: thay đổi DOM đã thử, kết quả tool có heal đúng không, có mask lỗi thật không〕

---

### [ ] WAT-17 — Diff assertions AI-generated vs hand-written — Thư
**SP:** 3 · **AC:** bảng so sánh side-by-side, ≥1 ví dụ AI assertion sai/thiếu edge case

〔Thư điền: bảng so sánh, ví dụ cụ thể AI bỏ sót gì〕

---

### [ ] WAT-18 — Chạy 3 lần AI-version trên slow network, so flakiness — Thư
**SP:** 2 · **AC:** bổ sung cột AI vào `metrics/flakiness.md`

〔Thư điền: kết quả 3 lần chạy, so với bản hand-written〕

---

### [ ] WAT-19 — Sections 2–3: Installation + First Test — Hiếu
**SP:** 3 · **AC:** người ngoài team reproduce được First Test theo đúng guide

〔Hiếu điền sau khi Khoa/M1 xong WAT-04/05/06 — xem `User_Guide.md` phần 〔fill in〕〕

---

### [ ] WAT-20 — Draft Activity_Worksheet.md "Locator Brawl" — Quang
**SP:** 3 · **AC:** time-boxed 0:00–0:25, worksheet + answer key, khả thi offline sau setup

〔Quang điền: bản worksheet + answer key〕

---

## SPRINT 3

### [ ] WAT-21 — Hoàn thành sections 4–7 User Guide — Khoa
**SP:** 5 · **AC:** Advanced Usage, Troubleshooting (≥3 lỗi thật), Failure Modes (≥3), References

〔Khoa điền dựa trên toàn bộ team-log Sprint 1–2 — xem bản nháp sẵn trong `User_Guide.md`, cần thay các 〔fill in〕 bằng dữ liệu thật〕

---

### [ ] WAT-22 — Quay Demo_Screencast.mp4 — Khoa (quay) + Hiếu (dựng)
**SP:** 5 · **AC:** 5–8 phút, 1080p, ≤100MB, tiếng Anh, không nhạc nền, 1 feature Playwright + 1 feature AI

〔Khoa/Hiếu điền: link file, thời lượng, nội dung từng đoạn〕

---

### [ ] WAT-24 — Seminar_Slides.pptx — Quang + Thư
**SP:** 3 · **AC:** ≤15 slides, cấu trúc pitch–demo cue–activity brief–debrief

〔Quang/Thư điền: link slide, outline từng phần〕

---

*Cuối mỗi sprint, đối chiếu log này với "Sprint Review checklist" tương ứng trong Sprint_Plan.md trước khi coi ticket là Done.*