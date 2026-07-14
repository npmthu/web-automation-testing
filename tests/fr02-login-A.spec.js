// WAT-6: FR-02 Login + Account Lockout
// Technique: Parameterised test + BVA-based test cases
// SUT: EShop : http://localhost:5173/login
//
// NOTE : Deviations from spec (observed on actual app):
//   [DEVIATION-1] Spec: lockout sau 3 lần sai. Thực tế: lockout sau 2 lần sai.
//   [DEVIATION-2] Spec: lockout 30 giây. Thực tế: lockout ~3 phút.
//   [DEVIATION-3] Spec: HTML5 validation báo sai format email. Thực tế: chỉ hiện "Đăng nhập thất bại".
//   [DEVIATION-4] Spec: Email case-insensitive. Thực tế: email chữ HOA bị từ chối.
//   [DEVIATION-5] HTML label không liên kết với input (thiếu for/id) → phải dùng nth() thay getByLabel().

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";
const LOGIN_URL = `${BASE_URL}/login`;

const VALID_EMAIL = "test@eshop.com";
const VALID_PASS = "Test1234!";
const WRONG_PASS = "WrongPass999";

// Helper: điền form và bấm Sign In
async function doLogin(page, email, password) {
  await page.goto(LOGIN_URL);
  await page.locator('input[type="text"]').nth(0).fill(email);
  await page.locator('input[type="text"]').nth(1).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

// Helper: điền thêm lần nữa mà không goto (dùng sau lần sai đầu, vẫn đang ở login page)
async function refillAndSubmit(page, password) {
  await page.locator('input[type="text"]').nth(1).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

// Helper: kiểm tra thông báo lỗi hiển thị
async function expectErrorMessage(page) {
  await expect(page.locator("div.bg-red-100.text-red-700")).toBeVisible();
}

// ─────────────────────────────────────────────
// GROUP 1: Login cơ bản
// ─────────────────────────────────────────────

test("TC-01 : Login thành công với thông tin đúng", async ({ page }) => {
  await doLogin(page, VALID_EMAIL, VALID_PASS);
  // Sau login thành công, không còn ở trang login nữa
  await expect(page).not.toHaveURL(LOGIN_URL);
});

test("TC-02 : Email rỗng → không submit được", async ({ page }) => {
  await doLogin(page, "", VALID_PASS);
  await expect(page).toHaveURL(LOGIN_URL);
});

test("TC-03 : Password rỗng → không submit được", async ({ page }) => {
  await doLogin(page, VALID_EMAIL, "");
  await expect(page).toHaveURL(LOGIN_URL);
});

test("TC-04 : Cả hai field rỗng → không submit được", async ({ page }) => {
  await doLogin(page, "", "");
  await expect(page).toHaveURL(LOGIN_URL);
});

// ─────────────────────────────────────────────
// GROUP 2: Email format
// [DEVIATION-3]: app không dùng HTML5 validation, chỉ hiện "Đăng nhập thất bại"
// ─────────────────────────────────────────────

const invalidEmailCases = [
  { id: "TC-05", email: "usergmail.com", desc: "thiếu @" },
  { id: "TC-06", email: "user@", desc: "thiếu domain" },
  { id: "TC-07", email: "@gmail.com", desc: "thiếu local part" },
];

for (const tc of invalidEmailCases) {
  test(`${tc.id} : Email sai format: ${tc.desc}`, async ({ page }) => {
    await doLogin(page, tc.email, VALID_PASS);
    await expectErrorMessage(page);
    await expect(page).toHaveURL(LOGIN_URL);
  });
}

// ─────────────────────────────────────────────
// GROUP 3: Sai password : trước khi lockout
// ─────────────────────────────────────────────

test("TC-08 : Sai password lần 1 → hiện lỗi, cho thử lại", async ({ page }) => {
  await doLogin(page, VALID_EMAIL, WRONG_PASS);
  await expectErrorMessage(page);
  await expect(page).toHaveURL(LOGIN_URL);
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
});

// [DEVIATION-1]: Spec cho thử lại sau 2 lần sai, thực tế bị lockout ở lần 2
test("TC-09 : Sai password lần 2 → bị lockout [DEVIATION-1]", async ({
  page,
}) => {
  await doLogin(page, VALID_EMAIL, WRONG_PASS); // lần sai 1
  await refillAndSubmit(page, WRONG_PASS); // lần sai 2 → lockout
  await expectErrorMessage(page);
  await expect(page).toHaveURL(LOGIN_URL);
});

// ─────────────────────────────────────────────
// GROUP 4: Lockout flow
// ─────────────────────────────────────────────

test("TC-10 : Sau khi tài khoản bị lockout, login đúng pass vẫn thất bại", async ({
  page,
}) => {
  await doLogin(page, VALID_EMAIL, WRONG_PASS); // lần sai 1
  await refillAndSubmit(page, WRONG_PASS); // lần sai 2 → lockout
  await refillAndSubmit(page, VALID_PASS); // thử đúng pass khi đang locked
  await expectErrorMessage(page);
  await expect(page).toHaveURL(LOGIN_URL);
});

test("TC-11 : Sai tiếp khi đang bị lockout → vẫn lỗi", async ({ page }) => {
  await doLogin(page, VALID_EMAIL, WRONG_PASS); // lần sai 1
  await refillAndSubmit(page, WRONG_PASS); // lần sai 2 → lockout
  await refillAndSubmit(page, WRONG_PASS); // sai thêm khi đang locked
  await expectErrorMessage(page);
});

test("TC-12 : Sau lockout ~3 phút, đăng nhập đúng pass thành công [DEVIATION-2]", async ({
  page,
}) => {
  test.setTimeout(240_000); // override global timeout cho test này

  // Trigger lockout (theo DEVIATION-1: lockout sau 2 lần sai)
  await doLogin(page, VALID_EMAIL, WRONG_PASS); // sai lần 1
  await refillAndSubmit(page, WRONG_PASS); // sai lần 2 → lockout

  // Verify đang bị locked
  await refillAndSubmit(page, VALID_PASS);
  await expectErrorMessage(page);

  // Chờ hết lockout — dùng waitForTimeout vì đây là boundary time test,
  // không có event nào để poll, phải chờ tuyệt đối
  const LOCKOUT_MS = 3 * 60 * 1000; // 3 phút (DEVIATION-2)
  await page.waitForTimeout(LOCKOUT_MS + 5000); // +5s buffer

  // Sau khi hết lockout → đăng nhập đúng phải thành công
  await doLogin(page, VALID_EMAIL, VALID_PASS);
  await expect(page).not.toHaveURL(LOGIN_URL);
});
