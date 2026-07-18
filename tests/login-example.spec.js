import { test, expect } from '@playwright/test';

const BASE_URL = "http://localhost:5173";
const LOGIN_URL = `${BASE_URL}/login`;

test.describe('FR-02: Login', () => {

  test('valid credentials log the user in', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Đăng nhập' }).click();
    await page.locator('input[type="text"]').first().fill('test@eshop.com');
    await page.locator('input[type="text"]').nth(1).fill('Test1234!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).not.toHaveURL(LOGIN_URL);
  });

  test('invalid credentials show an error message', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Đăng nhập' }).click();
    await page.locator('input[type="text"]').first().fill('23jadwj@gmail.com');
    await page.locator('input[type="text"]').nth(1).fill('123123232');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Đăng nhập thất bại. Vui lòng kiểm tra lại.')).toBeVisible();
  });

});