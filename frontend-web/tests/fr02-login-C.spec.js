// WAT-6: FR-02 Login — Security & Lockout Timeout Tests
// Technique: BVA (lockout time boundary) + Security / API abuse
// SUT:
//   User app  : http://localhost:5173/login
//   Admin app : http://localhost:5174/

import { test, expect, request } from "@playwright/test";

const USER_URL = "http://localhost:5173";
const ADMIN_URL = "http://localhost:5174";

const LOGIN_URL = `${USER_URL}/login`;
const ADMIN_LOGIN_URL = `${ADMIN_URL}/`; // codegen xác nhận admin login ở root

const VALID_EMAIL = "test@eshop.com";
const VALID_PASS = "Test1234!";
const WRONG_PASS = "WrongPass999";

const ADMIN_EMAIL = "admin@eshop.com";
const ADMIN_PASS = "Admin123!";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Đăng nhập trên User app (5173) — dùng nth() vì label bị lỗi [DEVIATION-5] */
async function userLogin(page, email, password) {
  await page.goto(LOGIN_URL);
  await page.locator('input[type="text"]').nth(0).fill(email);
  await page.locator('input[type="text"]').nth(1).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

/** Điền lại password rồi submit (không goto — đang ở login page) */
async function refillAndSubmit(page, password) {
  await page.locator('input[type="text"]').nth(1).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

/** Kiểm tra error message hiển thị */
async function expectErrorMessage(page) {
  await expect(page.locator("div.bg-red-100.text-red-700")).toBeVisible();
}

/** Trigger lockout: sai password 2 lần liên tiếp (theo DEVIATION-1) */
async function triggerLockout(page) {
  await userLogin(page, VALID_EMAIL, WRONG_PASS); // sai lần 1
  await refillAndSubmit(page, WRONG_PASS); // sai lần 2 → lockout
}

// ─────────────────────────────────────────────
// GROUP 7: Security / API abuse
// ─────────────────────────────────────────────

test("TC-18a : Backend phải từ chối khi user thường PUT role=admin", async ({
  page,
}) => {
  // ── Bước 1: Đăng nhập user thường ────────────────────────────
  await userLogin(page, VALID_EMAIL, VALID_PASS);
  await expect(page).not.toHaveURL(LOGIN_URL);

  // Lấy token từ localStorage (key "token" — xác nhận từ console dump)
  const token = await page.evaluate(() => localStorage.getItem("token"));
  expect(token, "Không tìm được token trong localStorage").not.toBeNull();
  console.log("[TC-18a] Token lấy được:", token.substring(0, 30) + "...");

  // ── Bước 2: Gọi API PUT đổi role qua page.request ────────────
  // Dùng page.request (KHÔNG dùng request.newContext) để request đi qua
  // Vite proxy (5173 → backend thật), tránh bị 404 do bypass proxy
  const res = await page.request.put(`http://localhost:3000/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: { role: "admin" },
  });

  console.log(
    `[TC-18a] PUT http://localhost:3000/api/users/me → HTTP ${res.status()}`,
  );
  const body = await res.json().catch(() => ({}));
  console.log("[TC-18a] Response body:", JSON.stringify(body));

  // ── Bước 3: Assert backend PHẢI từ chối ──────────────────────
  // Test này FAIL → expose BUG-04 (backend trả 200 và update thật)
  // Expected: 403 Forbidden hoặc 400 Bad Request
  expect(
    res.status(),
    `BUG-04: Backend chấp nhận PUT role=admin từ user thường (HTTP ${res.status()})`,
  ).not.toBe(200);

  // Role trong response không được là "admin"
  if (body.role !== undefined) {
    expect(body.role, "BUG-04: Role bị thay đổi thành admin").not.toBe("admin");
  }
});

test("TC-18b : Sau khi escalate, đăng nhập Admin app bằng tài khoản user phải bị chặn ", async ({
  page,
}) => {
  // ── Bước 1 & 2: Thực hiện escalation (lặp lại để TC độc lập) ─
  await userLogin(page, VALID_EMAIL, VALID_PASS);
  await expect(page).not.toHaveURL(LOGIN_URL);

  const token = await page.evaluate(() => localStorage.getItem("token"));
  expect(token, "Không tìm được token").not.toBeNull();

  // Dùng page.request để đi qua Vite proxy
  const escalateRes = await page.request.put(`${USER_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: { role: "admin" },
  });
  console.log(`[TC-18b] Escalation attempt → HTTP ${escalateRes.status()}`);

  // ── Bước 3: Đăng nhập Admin app (5174) bằng tài khoản user ──
  await page.goto(ADMIN_LOGIN_URL);
  await page.getByRole("textbox", { name: "Email" }).fill(VALID_EMAIL);
  await page.getByRole("textbox", { name: "Password" }).fill(VALID_PASS);
  await page.getByRole("button", { name: "Login" }).click();

  // ── Bước 4: Phải bị chặn — không vào được Admin app ─────────
  // Test này FAIL nếu BUG-04 cho phép vào admin dashboard
  const currentUrl = page.url();
  console.log(`[TC-18b] After login attempt on admin app → URL: ${currentUrl}`);

  await expect(
    page,
    "BUG-04: User thường đã escalate role và vào được Admin app",
  ).toHaveURL(ADMIN_LOGIN_URL);
});

// ─────────────────────────────────────────────────────────────────────────────
// TC-18c : Sanity check — Admin hợp lệ vào Admin app thành công
// Mục đích: xác nhận Admin app hoạt động đúng với tài khoản admin thật
// ─────────────────────────────────────────────────────────────────────────────

test("TC-18c : Admin hợp lệ đăng nhập Admin app thành công ", async ({
  page,
}) => {
  await page.goto(ADMIN_LOGIN_URL);
  await page.getByRole("textbox", { name: "Email" }).fill(ADMIN_EMAIL);
  await page.getByRole("textbox", { name: "Password" }).fill(ADMIN_PASS);

  // 1. Thiết lập lắng nghe API Login trước khi click nút Login
  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/login") &&
      response.request().method() === "POST",
  );

  // 2. Click Login để kích hoạt request
  await page.getByRole("button", { name: "Login" }).click();

  // 3. Chờ API phản hồi và kiểm tra xem status code có phải là 200/201 (đăng nhập thành công) hay không
  const response = await loginResponsePromise;

  // Assert rằng status là thành công (2xx), không phải 401 hay 500
  expect(response.ok()).toBeTruthy();
});
