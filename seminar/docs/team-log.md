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

_→ 4 tóm tắt trên sẽ chuyển thẳng vào Section 7 References của User_Guide.md khi làm WAT-21._

---

### [ ] WAT-10 — Draft khung User_Guide.md — Hiếu

**SP:** 2 · Đã hoàn thành riêng — xem file `User_Guide.md`, mục Introduction.

---

### [x] WAT-11 — Test FR-07 Add-to-Cart (flow #2) — Thư

**SP:** 3 · **AC:** login → add to cart → assert badge, pass ổn định

**Lệnh chạy:**

```bash
cd frontend-web
npx playwright test tests/add-to-cart.spec.js
```

**Kết quả:** pass ổn định (`1 passed`, ~2-4s). Flow: login (`test@eshop.com` /
`Test1234!`) → add to cart từ Home (1 click — cố tình tránh ProductDetail vì
trang đó có bug 2-click, xem `User_Guide.md` §6) → chuyển sang `/cart` bằng
click link nav (không `page.goto`, vì cart chỉ sống trong React state,
reload sẽ mất) → assert đúng 1 dòng, đúng tên sản phẩm, đúng số lượng.
"Badge" trong AC được diễn giải lại thành "nội dung giỏ hàng" vì header EShop
không có badge đếm item.

---

### [ ] WAT-12 — Test FR-08 Checkout (flow #3) — Quang

**SP:** 3 · **AC:** end-to-end, test data (user, sản phẩm) reproducible

**1. Lệnh để chạy chương trình (chạy theo thứ tự được mô tả):**

1.  Khởi động backend

```
cd backend
npm ci
node server.js
```

2.  Khởi động test chức năng ở frontend-web

```
cd frontend-web
npm ci
npx playwright install --with-deps
npx playwright test tests/checkout.spec.js
```

3.  Khởi động frontend-admin để kiểm tra kết quả

```
cd frontend-admin
npm install
npm run dev
```

**2. Kết quả mong đợi:**

1. Truy cập website frontend admin bằng `localhost:5174`
2. Ở phần `Dashboard`, `Tổng doanh thu` sẽ hiện 0đ và `Tổng số đơn hàng` sẽ hiện 1
3. Vào mục `Đơn hàng`, một đơn hàng sẽ xuất hiện ở trạng thái `Chờ xác nhận`

**3. Dữ liệu đầu vào:**

- Tài khoản test: `test1234@eshop.com`/`Test1234!`
- Web (user lẫn admin) ở trạng thái clean-state (i.e.: tài khoản chưa đăng nhập, chưa check-out, chưa có hàng ở trong giỏ hàng)
- Sản phẩm được thêm vào giỏ để thanh toán: `Iphone 15 Pro Max` (giá 30.000.000đ)

**4. Hình ảnh kết quả:**

1. Ảnh kiểm thử chức năng checkout bằng playwright trên command line
   ![Ảnh kiểm thử chức năng checkout bằng playwright trên command line](/seminar/docs/img/checkout_success.png)

2. Ảnh kết quả trên dashboard Admin
   ![Ảnh kết quả trên dashboard Admin](/seminar/docs/img/checkout_success_2.png)

---

### [x] WAT-13 — Đo flakiness: 10 runs/flow trên network-throttled; điều tra 1 flake — M1+M4

**SP:** 5 · **AC:** `metrics/flakiness.md` bảng first-run vs 10th-run, flake rate %, setup time, run time; root-cause analysis cho 1 flake cụ thể

Mở rộng format sẵn có của WAT-18 (vốn mới chỉ đo FR-07) sang FR-02 (login) và
FR-08 (checkout), mỗi flow 10 lần chạy tuần tự (`--workers=1`), cả normal
network lẫn throttled (dùng lại helper `emulateSlowNetwork` của WAT-18), qua
test file mới `frontend-web/tests/flakiness-sweep.spec.js`.

**Kết quả:** FR-02 (cả 2 network) và FR-08 normal-network: 0/10 flake. FR-08
**throttled: 2/10 = 20% flake** (`Test timeout of 30000ms exceeded`) — flow
này có nhiều lượt chuyển trang hơn FR-02/FR-07 (login → về Home → giỏ hàng →
checkout → xác nhận), nên bước `setup: login` dưới throttle (~27s, khớp với
số của WAT-18 cho FR-07) đã ăn gần hết 30s timeout mặc định, chỉ còn ~2-3s
margin cho phần còn lại — 2 lần chạy rơi vào đúng lúc cả setup lẫn phần sau
đều ở mức cao nhất trong khoảng dao động tự nhiên của chúng, cộng dồn vượt
30s. Root-cause đầy đủ + số liệu 10 dòng mỗi bảng: xem `metrics/flakiness.md`
(root), mục "WAT-13".

Ngoài ra có một investigation bổ sung (không bắt buộc theo AC) trên FR-07,
dùng production build + concurrency thật (`--workers=10`) thay vì dev server
tuần tự — tìm ra flake 5/10 do contention CPU/backend dùng chung, chi tiết ở
`frontend-web/metrics/flakiness.md`.

---

### [x] WAT-14 — Ghi nhận 3 failure modes thực tế của Playwright — M1+M3

**SP:** 3 · **AC:** mỗi mode có trigger/symptom/detection/mitigation (Template 2), không bịa, chỉ mode đã tái hiện hoặc có trong docs/GH issues

3 failure mode mới, bổ sung vào `User_Guide.md` §6 và `Seminar_Report.md`
Part VI (bên cạnh 4 mode đã có từ AI track):

1. Network throttling trên Vite dev server làm chính `page.goto()` timeout
   (tái hiện độc lập 2 lần: trong lúc làm WAT-13, và trong comment sẵn có
   của `network-throttle.js`).
2. Locator không scope kỹ gây strict-mode violation (tái hiện trực tiếp bằng
   1 diagnostic test, và độc lập trong `add-to-cart.ai-audited.spec.js` của
   WAT-18).
3. Test-level timeout không có margin sẽ flake ngay khi có concurrency thật
   (từ chính investigation bổ sung của WAT-13 trên FR-07).

Chi tiết đầy đủ từng mode: xem `User_Guide.md` §6 (Failure Modes) hoặc
`Seminar_Report.md` Part VI.

---

## SPRINT 2

### [x] WAT-15 — Rewrite Add-to-Cart bằng Copilot/Cursor — Thư

**SP:** 5 · **AC:** lưu bản AI-generated nguyên bản + bản đã audit/refactor, log prompt cho [AI-02]

Scenario ngôn ngữ tự nhiên (5 bước, không code/file path) ở
`tests/ai-track/scenario.md`. **Attempt 1** (giữ lại trong
`prompt-log.md` làm audit trail): môi trường lúc đó chưa có Copilot Agent
Mode / Playwright MCP nên dùng blind code generation — phát hiện 1 false
negative thật (assertion chỉ check URL, giỏ hàng thực ra rỗng). **Attempt 2**
(bản chính thức, dùng Playwright MCP — `browser_navigate`/`snapshot`/`click`
qua Claude Code, điều khiển trình duyệt thật trên EShop): agent tự khám phá
ra bug 2-click của `ProductDetail.jsx` qua snapshot (không phải đoán), viết
`tests/ai-track/add-to-cart.ai-generated.spec.js` (bản nguyên bản, chạy pass
thật) rồi audit thành `add-to-cart.ai-audited.spec.js` (sửa: đọc tên sản
phẩm từ DOM thay vì hardcode, thêm lại row-count assert, thêm
`waitForURL` để tránh race — root-cause tại WAT-18). Log prompt đầy đủ:
`tests/ai-track/prompt-log.md`.

---

### [ ] WAT-16 — Self-healing locator experiment (Testim) trên FR-02 — Thư

**SP:** 3 · **AC:** so sánh Testim locator vs `data-test-id`, thử 1 DOM change nhỏ, ghi kết quả heal/mask

**Chưa làm.** Môi trường làm WAT-15 không có Testim account (ghi rõ trong
`prompt-log.md`: "environment didn't have ... a Testim account"). Cần đăng
ký trial (WAT-08) trước khi làm được ticket này — để `[ ]` thay vì bịa kết
quả.

---

### [x] WAT-17 — Diff assertions AI-generated vs hand-written — Thư

**SP:** 3 · **AC:** bảng so sánh side-by-side, ≥1 ví dụ AI assertion sai/thiếu edge case

Bảng so sánh đầy đủ (hand-written vs AI-generated MCP-derived vs AI-audited)
ở `tests/ai-track/assertions-diff.md`. Ví dụ cụ thể AI bỏ sót: bản
AI-generated (chưa audit) hardcode tên sản phẩm literal thay vì đọc từ DOM
→ không robust nếu catalog đổi thứ tự hoặc mở sản phẩm khác; và dùng
`toBeVisible()` trên text thay vì assert đúng số dòng → không phát hiện được
nếu có thêm 1 dòng thừa trong giỏ hàng. Cả hai gap này được sửa ở bản audited.

---

### [x] WAT-18 — Chạy 3 lần AI-version trên slow network, so flakiness — Thư

**SP:** 2 · **AC:** bổ sung cột AI vào `metrics/flakiness.md`

3 lần chạy mỗi bản (hand-written vs AI-audited), throttle qua
`tests/helpers/network-throttle.js` (~1.6Mbps/750kbps/150ms, "Fast 3G"-like
— profile "Slow 3G" khắc nghiệt hơn làm chính `page.goto` timeout dưới dev
server nên không dùng được). Lần chạy đầu: hand-written 3/3 pass, AI-audited
1/3 pass (2 flake — strict-mode violation do đọc `<h1>` giữa lúc SPA đang
chuyển route). Root-cause + fix (`waitForURL` trước khi đọc `<h1>`) → chạy
lại tuần tự: 6/6 pass, thời gian gần như giống hệt nhau giữa 2 bản
(~27.2-27.5s). Chi tiết đầy đủ, bảng số liệu: `metrics/flakiness.md` (root),
mục "WAT-18".

---

### [ ] WAT-19 — Sections 2–3: Installation + First Test — Hiếu

**SP:** 3 · **AC:** người ngoài team reproduce được First Test theo đúng guide

〔Hiếu điền sau khi Khoa/M1 xong WAT-04/05/06 — xem `User_Guide.md` phần 〔fill in〕〕

---

### [ ] WAT-20 — Draft Activity_Worksheet.md "Locator Brawl" — Quang

**SP:** 3 · **AC:** time-boxed 0:00–0:25, worksheet + answer key, khả thi offline sau setup

Đã hoàn thành — xem file [Activity_Worksheet.md](/seminar/docs/Activity_Worksheet.md)

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

### [x] WAT-24 — Seminar_Slides.pptx — Thư

**SP:** 3 · **AC:** ≤15 slides, cấu trúc pitch–demo cue–activity brief–debrief

〔[Link slide](https://docs.google.com/presentation/d/1ZbOQ4V_kS9AA9yIE5Ih0_suQR7H1H4Tp/edit?usp=drive_link&ouid=102155320609782064035&rtpof=true&sd=true)〕

---

_Cuối mỗi sprint, đối chiếu log này với "Sprint Review checklist" tương ứng trong Sprint_Plan.md trước khi coi ticket là Done._
