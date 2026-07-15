# Team Log — WAT (Web Automation Testing, Topic T02)

> Ghi liên tục theo ticket thật đã làm. Mỗi mục = 1 entry mới, không xoá entry cũ.
> Nội dung ở đây sẽ là nguyên liệu cho `User_Guide.md`, `metrics/flakiness.md`, và `[AI-02]` sau này —
> nên ghi đúng những gì thật sự xảy ra, không suy diễn hộ người khác.

---

## SPRINT 1

### [ x WAT-06 — Test FR-02 Login + lockout (flow #1) — Khoa

**SP:** 5 · **Acceptance Criteria:** pass trên chromium + firefox, parameterised, locator dùng `data-test-id`

**1. Lệnh chạy:**
```
npx playwright test tests/fr02-login-A.spec.js tests/fr02-login-B.spec.js tests/fr02-login-C.spec.js --project=chromium --project=firefox
```

 Chưa chạy `--project=firefox` — cần bổ sung để đạt đủ AC trước khi đóng ticket.

**2. Kết quả:**
| File | Tests | Chromium | Firefox |
|---|---|---|---|
| fr02-login-A.spec.js | 12 | 12 passed (3.2m) | *chưa chạy* |
| fr02-login-B.spec.js | 4 | 4 passed (2.4s) | *chưa chạy* |
| fr02-login-C.spec.js | 3 | 2 passed, **1 failed** (1.7s) | *chưa chạy* |
| **Tổng** | **19** | **18 passed, 1 failed** | — |

**Test fail — không phải flaky, là bug thật ở backend:**
- **Case:** `fr02-login-C.spec.js:53:5` — TC-18a: "Backend phải từ chối khi user thường PUT role=admin"
- **BUG-04:** Backend chấp nhận PUT `role=admin` từ user thường, trả về `HTTP 200` (`{"message":"Profile updated"}`) thay vì từ chối như kỳ vọng (`expected: not 200`)
- **Liên quan:** TC-18b (escalate xong login vào Admin app) đã đúng — bị chặn đúng như kỳ vọng, redirect về `http://localhost:5174/`. Vậy lỗi chỉ nằm ở tầng API (`PUT /api/users/me`), chưa tới mức chiếm được quyền Admin app, nhưng vẫn là lỗ hổng cần backend fix.
- Error context lưu tại: `test-results/fr02-login-C-TC-18a-Backend-c3a43--user-thường-PUT-role-admin-chromium/error-context.md`

**3. Locator dùng:**
- `page.getByTestId('____')` *(điền tên `data-test-id` thật đã dùng trong A/B/C)*

**4. Ghi chú:**
- `login-example.spec.js` (positional `.first()/.nth(1)`) chỉ là bài minh hoạ Section 3 của `User_Guide.md`, khác với bộ test chính thức đạt AC (`fr02-login-A/B/C.spec.js`, data-test-id).
- BUG-04 nên được log thành GitHub Issue riêng (không gộp vào ticket này), và có thể dùng làm ví dụ thật cho phần "Failure Modes" hoặc thậm chí phần security trong User_Guide — vì nó chứng minh test tự động hoá thực sự bắt được lỗi thật, không phải chỉ chạy cho có.

**5. Hình ảnh kết quả:**
1. Kết quả chạy `fr02-login-C.spec.js` — 2 passed, 1 failed (BUG-04)
![fr02-login-C terminal output](/seminar/docs/img/wat06_C_terminal.png)

2. Kết quả chạy `fr02-login-B.spec.js` — 4 passed
![fr02-login-B terminal output](/seminar/docs/img/wat06_B_terminal.png)

3. Kết quả chạy `fr02-login-A.spec.js` — 12 passed
![fr02-login-A terminal output](/seminar/docs/img/wat06_A_terminal.png)
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

### [x] WAT-10 — Draft khung User_Guide.md — Hiếu

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

### [x] WAT-12 — Test FR-08 Checkout (flow #3) — Quang

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
ký trial (WAT-08) trước khi làm được ticket này.
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

### [x] WAT-19 — Sections 2–3: Installation + First Test — Hiếu

**SP:** 3 · **AC:** người ngoài team reproduce được First Test theo đúng guide

**Cài đặt:** `npm init playwright@latest` — chọn **JavaScript** (không phải
TypeScript), thư mục mặc định `tests/`, cài cả 3 browser (chromium, firefox,
webkit). `baseURL` set trong `playwright.config.js` trỏ về
`http://localhost:5173` (frontend-web qua `npm run dev`; backend qua
`node server.js` ở port 3000).

**Sự cố gặp trong lúc setup (đã đưa vào `User_Guide.md` §5 —
Troubleshooting):** `login-example.spec.js` ban đầu bị đặt sai thư mục
(`seminar/seminar/` thay vì `seminar/tests/`), khiến `page.goto('/')` báo
lỗi `Cannot navigate to invalid URL` vì file nằm ngoài `testDir: './tests'`
của config root. Fix: dời file vào đúng `tests/`.

**Chẩn đoán nhầm ban đầu — đã đính chính:** trong lúc debug, phát hiện có 2
file `playwright.config.js` (root và `frontend-web/`) và ban đầu nghi đây là
lỗi tạo nhầm, định xoá cái trong `frontend-web/`. Sau khi pull lại repo từ
Thư và đối chiếu với WAT-11/WAT-12, xác nhận đây là **2 project tách biệt
có chủ đích**: root lo login (`tests/`), `frontend-web/` có config riêng lo
cart/checkout/AI-track. Không xoá gì — đã ghi rõ cấu trúc này vào
`User_Guide.md` §5 để tránh người khác hiểu nhầm giống vậy.

**First Test (FR-02 Login):** dùng `npx playwright codegen
http://localhost:5173` để lấy locator thật thay vì đoán — form login không
gắn `label`/`placeholder` chuẩn nên Codegen trả về locator theo vị trí
(`getByRole('textbox').first()` / `.nth(1)`), không lấy được bằng
`getByLabel()` — ghi làm 1 finding cho `User_Guide.md` §6 (Failure Modes),
trùng khớp với phát hiện tương tự của Thư ở FR-07 (field "Username" nhưng
thực chất là email).

Viết `tests/login-example.spec.js` với 2 test case (valid credentials login
+ invalid credentials hiện đúng thông báo lỗi *"Đăng nhập thất bại. Vui lòng
kiểm tra lại."*) — đặt tên `-example` để phân biệt rõ với bộ test FR-02
chính thức, đầy đủ hơn (lockout, edge case, security) của Khoa
(`fr02-login-A/B/C.spec.js`, WAT-06).

**Kết quả:** sau khi sửa xong thư mục, chạy lại
`npx playwright test tests/login-example.spec.js` — **2/2 pass** (cả valid
và invalid credentials). [Ảnh kết quả](/seminar/docs/img/run_login_example.png)

---

### [x] WAT-20 — Draft Activity_Worksheet.md "Locator Brawl" — Quang

**SP:** 3 · **AC:** time-boxed 0:00–0:25, worksheet + answer key, khả thi offline sau setup

Đã hoàn thành — xem file [Activity_Worksheet.md](/seminar/docs/Activity_Worksheet.md)

---

## SPRINT 3

### [x] WAT-21 — Hoàn thành sections 4–7 User Guide — Khoa + Hiếu

**SP:** 5 · **AC:** Advanced Usage, Troubleshooting (≥3 lỗi thật), Failure Modes (≥3), References

**Khoa** viết bản đầu, dựa trên toàn bộ team-log Sprint 1–2: Section 4
(config file, locator priority, parallel workers, `storageState`, trace
viewer, AI-grounded workflow), Section 6 (6 failure mode thật — 3 từ AI
track có sẵn + 3 mới từ WAT-13/14: network throttling làm `page.goto`
timeout, strict-mode violation do locator không scope, timeout không có
margin khi có concurrency thật), Section 7 (đủ 6 nguồn, đúng chuẩn trích
dẫn).

**Hiếu** rà lại sau khi Khoa nộp, sửa 3 chỗ còn sai/sót:

1. Section 1 bị sót câu cũ nhắc "TypeScript" (nhóm dùng JavaScript) — sửa
   lại đúng.
2. Section 5 (Troubleshooting) dòng 2 mô tả sai — ghi "xoá config thừa
   trong `frontend-web/`" trong khi thực tế đó là **thiết kế đúng, không
   phải lỗi** (xem đính chính ở WAT-19) — viết lại đúng, thêm 1 đoạn note
   giải thích cấu trúc 2 project (root vs `frontend-web/`) để người đọc
   sau không hiểu nhầm giống vậy.
3. Section 5 lúc đó chỉ có 2 lỗi thật (thiếu so với AC ≥3) và còn 1 dòng
   bảng trống — thêm dòng thứ 3 (strict-mode violation, lấy từ dữ liệu thật
   đã có sẵn ở Section 6), xoá dòng trống.

**Kết quả:** `User_Guide.md` đã đủ 7 section, ảnh screenshot (`img/install_success.png`) và 6 reference (có link thật, không copy).

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