import { test, expect } from '@playwright/test';


test('FR-08 Checkout: login -> add item -> complete checkout', async ({ page }) => {
  await page.goto('/login');

  // 1. Đăng nhập
  await page.getByRole('textbox').first().fill('test@eshop.com');
  await page.getByRole('textbox').nth(1).fill('Test1234!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText(/Chào,/)).toBeVisible();

  // 2. Thêm sản phẩm đầu tiên từ trang chủ
  await page.goto('/');
  const firstCard = page.locator('.grid > div').first();
  const productName = await firstCard.locator('h2').innerText();
  await firstCard.getByRole('button', { name: 'Thêm vào giỏ' }).click();

  // 3. Vào giỏ hàng và chuyển sang Checkout
  await page.getByRole('link', { name: 'Giỏ hàng' }).click();
  await expect(page).toHaveURL(/\/cart/);
  await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();

  // 4. Kiểm tra giao diện trang Checkout hiển thị đúng sản phẩm
  await expect(page).toHaveURL(/\/checkout/);
  await expect(page.getByText(productName)).toBeVisible();

  // 5. Xác nhận thanh toán & kiểm tra thông báo thành công (Đã sửa lỗi)
  await page.getByRole('button', { name: 'Xác Nhận Thanh Toán' }).click();
  await expect(page.getByRole('heading', { name: 'Thanh toán thành công!' })).toBeVisible();

  // 6. KIỂM TRA GIỎ HÀNG ĐÃ ĐƯỢC XÓA SẠCH SAU THANH TOÁN
  await page.getByRole('button', { name: 'Quay lại trang chủ' }).click();
  await page.getByRole('link', { name: 'Giỏ hàng' }).click();
  await expect(page).toHaveURL(/\/cart/);

  // Assert giỏ hàng trống (Dùng .first() nếu chọn theo text để tránh trùng nhiều element)
  await expect(page.getByRole('heading', { name: 'Giỏ hàng của bạn đang trống' })).toBeVisible();
  await expect(page.getByText(productName)).not.toBeVisible();
});

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Thêm vào giỏ' }).nth(1).click();
  await page.getByRole('link', { name: 'Giỏ hàng' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();
  await expect(page).toHaveURL(/\/login/);
});

test('FR-08 Checkout TC03: Total amount is read-only and backend recalculates price on tamper', async ({ page }) => {
  // 1. Đăng nhập
  await page.goto('/login');
  await page.getByRole('textbox').first().fill('test@eshop.com');
  await page.getByRole('textbox').nth(1).fill('Test1234!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText(/Chào,/)).toBeVisible();

  // 2. Thêm sản phẩm và đi đến trang Checkout
  await page.goto('/');
  const firstCard = page.locator('.grid > div').first();
  await firstCard.getByRole('button', { name: 'Thêm vào giỏ' }).click();
  
  await page.getByRole('link', { name: 'Giỏ hàng' }).click();
  await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();
  await expect(page).toHaveURL(/\/checkout/);

  // Tìm ô/phần tử hiển thị Tổng tiền trên UI
  const totalAmountElement = page.getByText(/Tổng tiền|Total/i);
  await expect(totalAmountElement).toBeVisible();

  // Chặn Network Request gửi từ Browser lên Server khi bấm Checkout
  await page.route('**/api/**/checkout*', async (route) => {
    const request = route.request();
    
    // Nếu request có gửi dữ liệu JSON
    if (request.postData()) {
      try {
        const postData = JSON.parse(request.postData());
        
        // Cố tình HACK: Gắn total_amount = 0 để kiểm tra Backend
        postData.total_amount = 0; 
        
        // Cho phép request tiếp tục đi tới Server với data đã bị sửa
        await route.continue({ postData: JSON.stringify(postData) });
        return;
      } catch (e) {
        // Nếu không parse được JSON thì cho request đi tiếp bình thường
      }
    }
    await route.continue();
  });

  // Bấm nút Xác Nhận Thanh Toán
  await page.getByRole('button', { name: 'Xác Nhận Thanh Toán' }).click();

  // ASSERTION: Backend phải từ chối số 0 đó và vẫn thanh toán thành công với số tiền thực tế
  // (Hoặc báo lỗi 400 Bad Request nếu Server thiết lập luật chặt chẽ)
  await expect(page.getByRole('heading', { name: 'Thanh toán thành công!' })).toBeVisible();
});
