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
// GROUP 5: Reset bộ đếm sau login thành công
// ─────────────────────────────────────────────

test("TC-14 : Login thành công reset bộ đếm về 0", async ({ page }) => {
  // Sai 1 lần (chưa tới lockout)
  await doLogin(page, VALID_EMAIL, WRONG_PASS);
  // Login đúng → thành công, bộ đếm reset
  await refillAndSubmit(page, VALID_PASS);
  await expect(page).not.toHaveURL(LOGIN_URL);

  // Sai 1 lần nữa sau reset → không bị lockout ngay
  await doLogin(page, VALID_EMAIL, WRONG_PASS);
  await expectErrorMessage(page);
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
});

// ─────────────────────────────────────────────
// GROUP 6: Edge cases
// ─────────────────────────────────────────────

// [DEVIATION-4]: Email chữ HOA bị từ chối
test("TC-15 : Email chữ HOA → thất bại [DEVIATION-4]", async ({ page }) => {
  await doLogin(page, VALID_EMAIL.toUpperCase(), VALID_PASS);
  await expectErrorMessage(page);
});

test("TC-16 : Password sai hoa/thường → thất bại (case-sensitive, đúng spec)", async ({
  page,
}) => {
  await doLogin(page, VALID_EMAIL, VALID_PASS.toUpperCase());
  await expectErrorMessage(page);
});

test("TC-17 : Email không tồn tại → thất bại", async ({ page }) => {
  await doLogin(page, "notexist@eshop.com", VALID_PASS);
  await expectErrorMessage(page);
});
