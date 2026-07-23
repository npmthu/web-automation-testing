import { test, expect } from '@playwright/test';

test.describe('FR-07: Giỏ hàng (Shopping Cart)', () => {

  // Hook chạy trước mỗi test: Đảm bảo user luôn được login và ở trang chủ
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('form input').nth(0).fill('test@eshop.com'); 
    await page.locator('form input').nth(1).fill('Test1234!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText(/Chào,/)).toBeVisible();
    await page.goto('/');
  });

  test('TC01: Giỏ hàng trống hiển thị hình minh họa và thông báo rõ ràng', async ({ page }) => {
    await page.getByRole('link', { name: 'Giỏ hàng' }).click();
    
    // Kiểm tra UI giỏ hàng trống (Tùy UI thực tế của bạn để chỉnh lại selector)
    await expect(page.getByText(/Giỏ hàng của bạn đang trống/i)).toBeVisible();
  });

  test('TC02: Thêm cùng sản phẩm sẽ tăng số lượng, không tạo dòng mới', async ({ page }) => {
    const firstCard = page.locator('.grid > div').first();
    const productName = await firstCard.locator('h2').innerText();

    // Click thêm vào giỏ 2 lần liên tiếp
    await firstCard.getByRole('button', { name: 'Thêm vào giỏ' }).click();
    // Đợi 1 chút nếu UI có animation (Tốt nhất là đợi Toast message nếu có)
    await page.waitForTimeout(500); 
    await firstCard.getByRole('button', { name: 'Thêm vào giỏ' }).click();

    await page.getByRole('link', { name: 'Giỏ hàng' }).click();

    // Verify: Chỉ có 1 dòng (row) duy nhất trong bảng cho sản phẩm này
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(1);
    
    // Verify: Số lượng (Quantity) phải là 2
    const quantityInput = rows.first().locator('input[type="number"], .quantity-display');
    await expect(quantityInput).toHaveValue('2'); 
  });

  test('TC03: Hiển thị đúng nhãn Tổng cộng và nút Tiếp tục mua sắm', async ({ page }) => {
    // Thêm 1 món để vào giỏ
    const firstCard = page.locator('.grid > div').first();
    await firstCard.getByRole('button', { name: 'Thêm vào giỏ' }).click();
    await page.getByRole('link', { name: 'Giỏ hàng' }).click();

    // Verify: Nhãn "Tổng cộng" xuất hiện, KHÔNG phải "Tổng tạm tính"
    await expect(page.getByText('Tổng cộng', { exact: true })).toBeVisible();
    await expect(page.getByText('Tổng tạm tính')).not.toBeVisible();

    // Verify: Nút Tiếp tục mua sắm đưa về trang chủ
    await page.getByRole('button', { name: /Tiếp tục mua sắm/i }).click();
    await expect(page).toHaveURL(/\/$/); // Matches root URL
  });

  test('TC04: Xóa sản phẩm phải có Dialog xác nhận', async ({ page }) => {
    // Thêm 1 món để vào giỏ
    const firstCard = page.locator('.grid > div').first();
    await firstCard.getByRole('button', { name: 'Thêm vào giỏ' }).click();
    await page.getByRole('link', { name: 'Giỏ hàng' }).click();

    // Set up Playwright để BẮT (intercept) thẻ Dialog (Confirm/Alert của Browser)
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm'); // Phải là dạng Confirm có Yes/No
      expect(dialog.message()).toContain('Bạn có chắc muốn xóa'); // Text trong dialog
      await dialog.accept(); // Bấm OK
    });

    // Bấm nút xóa (Icon thùng rác hoặc chữ Xóa)
    await page.getByRole('button', { name: /Xóa/i }).first().click();

    // Verify: Bảng giỏ hàng đã trống (hoặc row bằng 0)
    await expect(page.locator('table tbody tr')).toHaveCount(0);
  });

});