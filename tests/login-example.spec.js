import { test, expect } from '@playwright/test';

test.describe('FR-02: Login', () => {

  test('valid credentials log the user in', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Đăng nhập' }).click();
    await page.getByRole('textbox').first().fill('test@eshop.com');
    await page.getByRole('textbox').nth(1).fill('Test1234!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // TODO: xác nhận lại dấu hiệu thật sau khi login thành công (tên user hiện ra, nút Đăng nhập biến mất...)
    await expect(page.getByRole('link', { name: 'Đăng nhập' })).not.toBeVisible();
  });

  test('invalid credentials show an error message', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Đăng nhập' }).click();
    await page.getByRole('textbox').first().fill('23jadwj@gmail.com');
    await page.getByRole('textbox').nth(1).fill('123123232');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Đăng nhập thất bại. Vui lòng kiểm tra lại.')).toBeVisible();
  });

});