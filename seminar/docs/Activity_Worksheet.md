# Activity Worksheet: Locator Brawl

## Goal

Turn Playwright locator design into a timed hands-on challenge. Teams must choose the best locators, fix brittle selectors, and write a checkout flow snippet for EShop within 25 minutes.

## Why this matters

Good locators are the difference between a stable test and a flaky one. This worksheet teaches the three core locator qualities we will use in the live seminar:

- semantic: based on role, label, or visible text
- stable: resistant to DOM layout changes
- readable: easy for teammates to understand and audit

---

## Setup (offline after initial setup)

Prerequisites:

- `backend/server.js` running locally on `http://localhost:3000`
- `frontend-web` running locally on `http://localhost:5173`
- repo already installed and built once
- browser DevTools / element inspector available

This activity is designed to be completed offline after the initial local setup. All tasks use local UI text and app structure, not external internet resources.

---

## Timeline (0:00–0:25)

- 0:00–0:03 — Instructions and team roles
- 0:03–0:10 — Task 1: choose the best locator
- 0:10–0:16 — Task 2: fix the brittle locator
- 0:16–0:22 — Task 3: write the checkout locator code
- 0:22–0:25 — Answer review and short debrief

---

## Instructions

1. Work in pairs or groups of three.
2. Each task should take 2–4 minutes.
3. Write your chosen locator expression and one sentence of justification.
4. Use Playwright locator styles as shown in the team workspace.
5. Do not use selectors based on position or poor class names when a better semantic alternative exists.

---

## Task 1 — Locator choice (0:03–0:10)

For each UI target below, choose the best locator from the three options and mark it A, B, or C. Write a one-sentence reason.

### 1.1 Login link on the homepage

A. `page.locator('a[href="/login"]')`

B. `page.getByRole('link', { name: 'Đăng nhập' })`

C. `page.locator('header nav a').first()`

### 1.2 Add-to-cart button on the first product card

A. `page.getByRole('button', { name: 'Thêm vào giỏ' }).first()`

B. `page.locator('.grid > div').first().getByRole('button', { name: 'Thêm vào giỏ' })`

C. `page.locator('button').nth(4)`

### 1.3 Coupon code input on the checkout page

A. `page.getByPlaceholder('Nhập mã giảm giá...')`

B. `page.locator('input[type="text"]').nth(0)`

C. `page.getByLabel('Mã Giảm Giá')`

---

## Task 2 — Fix the brittle locator (0:10–0:16)

The application frontend changes so that the product card wrapper gains a new `div` between `.grid` and each card. The old locator below now fails.

Replace it with a stronger locator.

Old locator:

```js
await page.locator('.grid > div').first().getByRole('button', { name: 'Thêm vào giỏ' }).click();
```

Write a robust replacement locator below.


---

## Task 3 — Checkout flow snippet (0:16–0:22)

Write the Playwright code for these three steps in the checkout flow. Use the actual EShop UI text.

1. Click the `Giỏ hàng` navigation link.
2. Click the checkout button: `Tiến hành thanh toán`.
3. Confirm the success message: `Thanh toán thành công!`.

Write the minimal 3-line code snippet.

---

## Answer Key

### Task 1 answers

1.1 Best locator: B

- Why: `getByRole('link', { name: 'Đăng nhập' })` uses visible accessible text and role. It is stable and does not depend on page order or CSS structure.

1.2 Best locator: A

- Why: `getByRole('button', { name: 'Thêm vào giỏ' }).first()` is readable, semantic, and avoids brittle layout assumptions. Option B is acceptable but still depends on the card wrapper structure; option C is fragile and index-based.

1.3 Best locator: C

- Why: `getByLabel('Mã Giảm Giá')` is the strongest semantic locator when a visible label exists. Option A is also okay, but placeholder text is less stable than an explicit label.

### Task 2 answer

Strong locator examples:

```js
await page.getByRole('button', { name: 'Thêm vào giỏ' }).first().click();
```

or if needing to scope to the first product card:

```js
await page.locator('.grid').locator('article').first().getByRole('button', { name: 'Thêm vào giỏ' }).click();
```

Rationale: avoid a selector that depends on the exact `.grid > div` child structure. The best choice is a semantic button locator, optionally scoped to a visible card element.

### Task 3 answer

```js
await page.getByRole('link', { name: 'Giỏ hàng' }).click();
await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();
await expect(page.getByText('Thanh toán thành công!')).toBeVisible();
```

Rationale: each locator uses visible text and role, which is the recommended Playwright pattern for this app.

---

## Debrief questions (0:22–0:25)

Discuss quickly as a team:

1. Which locator choices felt the most brittle, and why?
2. If the UI text changes from `Thêm vào giỏ` to `Thêm vào giỏ hàng`, which selector would still work without change?
3. How does choosing a semantic locator help when the application is refactored?

---

## Notes for the seminar facilitator

- Keep the pace strict: move to the next task at the 3-minute mark.
- If teams finish early, ask them to compare the semantic strength of their answers.
- Use local app screenshots or code snippets if any team is unsure about the exact element text.
- This activity is intentionally executable offline after the app setup is completed.
