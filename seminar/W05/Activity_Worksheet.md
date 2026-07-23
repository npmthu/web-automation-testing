# Activity Worksheet — "Locator Brawl: Hand-crafted vs AI-suggested"

**Seminar:** T02 — Web Automation Testing · Group 07
**SUT:** EShop (React + Node.js/Express) — flow: Login → Add-to-Cart → assert cart state
**Duration:** 25 minutes (0:00–0:25)

> **Before you start:** figure out whether your team is **Team A** or **Team B** (assigned by the facilitator). Both teams use this same worksheet — only Section 3A / 3B differs. Chromium only — no need to test other browsers for this activity.

---

## 1. Learning Objectives

By the end of the activity, each team should be able to answer (from your own hands-on data, not memorized):

1. Which locators hold up better across 3 runs on a slow network — hand-written or AI-suggested?
2. What kind of locator does AI tend to pick (role/text vs CSS/XPath) when the page lacks `data-test-id`?
3. Does a passing test actually verify the right thing — or just that *something* happened?
4. What order should a "good locator" rubric prioritize?

---

## 2. Reference — EShop DOM (from source, so you're not hunting for it live)

**Home page (`localhost:5173/`):**
```text
<h1>Danh sách sản phẩm</h1>
<input type="text" placeholder="Tìm kiếm...">
Product card (repeats per product):
  <h2>{product.name}</h2>
  <p>{price} VND</p>
  <a href="/product/{id}">Xem chi tiết</a>
  <button>Thêm vào giỏ</button>
```

**Login (reached via "Đăng nhập" link):**
```text
<form>
  <input>  <!-- email — no aria-label -->
  <input>  <!-- password — no aria-label -->
  <button>Sign In</button>
</form>
```
> Note: these two `<input>` fields are **not** wired to accessible labels — `getByLabel()` will not resolve either one. Keep this in mind for Section 3A/3B.

**Cart page (`localhost:5173/cart`):**
```text
<h2>Giỏ Hàng</h2>
<table>
  <th>Sản phẩm | Giá | Số lượng | Thành tiền | Thao tác</th>
  <tr> per item:
    <td>{item.name}</td> <td>{item.price}</td> <td>{item.quantity}</td>
    <td>{lineTotal}</td> <button>Xóa</button>
</table>
```

---

## 3A. If you're **Team A** (Hand-crafted) — fill in this section

**Locator used for each step:**

| Step in flow | Locator used | Type (role/label/text/testid/css-xpath) |
|---|---|---|
| Enter email | | |
| Enter password | | |
| Click Sign In | | |
| Click "Thêm vào giỏ" (first product) | | |
| Navigate to cart | | |
| Assert product is in cart | | |

**Assertion — what did you actually check?** (circle one, then explain)

`getByText(productName).toBeVisible()`  /  row count = 1  /  quantity = '1'  /  other: _______

Why did you pick that assertion over the others? _________________________________

**Results across 3 runs (Slow 4G throttle):**

| Run | Pass/Fail | Which locator broke (if any) | Reason for failure |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**Time to write the test (minutes):** _____
**Number of times you had to fix a locator after writing it:** _____

---

## 3B. If you're **Team B** (AI-suggested) — fill in this section

**Which AI tool, and with or without live-browser grounding (MCP)?** _______________

**Prompt used (copy verbatim):**


**Locator suggested by AI for each step:**

| Step in flow | AI-suggested locator | Type (role/label/text/testid/css-xpath) | Does it actually exist on the page? |
|---|---|---|---|
| Enter email | | | |
| Enter password | | | |
| Click Sign In | | | |
| Click "Thêm vào giỏ" | | | |
| Navigate to cart | | | |
| Assert product is in cart | | | |

**Assertion — what did the AI actually check?** (circle one, then explain)

`getByText(productName).toBeVisible()`  /  row count = 1  /  quantity = '1'  /  URL only  /  other: _______

Would that assertion still pass if the cart ended up empty, or had 2 rows instead of 1? _____ Why? _________

**Results across 3 runs (Slow 4G throttle):**

| Run | Pass/Fail | Which locator broke (if any) | Reason for failure |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**Time from prompt to a running test (minutes):** _____
**Number of locators you had to fix by hand after AI generation:** _____
**Did the AI "invent" a locator/element that doesn't exist?** (yes/no, details) _____

---

## 4. Cross-review (both teams fill in, after swapping worksheets, 0:15–0:20)

- Does the other team's locator use a semantic attribute (role/label/text), or does it rely on position (CSS index, absolute XPath)?
- Does the other team's **assertion** actually confirm the product is in the cart correctly (name + quantity), or would it still pass on a partially-broken cart (e.g. empty, wrong quantity, duplicate row)?
- If EShop's UI changes slightly (class renamed, field order changed), which of the other team's locators is most likely to break?
- Overall stability score (1–5, 5 = most stable): Team A ___ / Team B ___
- Overall assertion strength score (1–5, 5 = catches the most real problems): Team A ___ / Team B ___

---

## 5. Good Locator Rubric (whole class agrees together, write on the whiteboard)

Priority order, highest to lowest:

1. ___________________________
2. ___________________________
3. ___________________________
4. ___________________________

---

## 6. Facilitator Scoring Rubric (for M3 — not shown to teams beforehand)

| Criterion | Excellent (5) | Good (3) | Needs improvement (1) |
|---|---|---|---|
| **Locator quality (3A/3B)** | All 6 steps use semantic locators where the DOM allows it; positional fallback only where labels are genuinely missing (login fields), and flagged as such | 4–5 semantic; 1–2 fall back to CSS/index without noting why | Mostly CSS/XPath/index; no semantic locators attempted |
| **Assertion strength** | Assertion checks product identity + quantity (or row count), not just visibility/URL | Assertion checks product name only, or partial state | Assertion only checks navigation/URL, would pass on a broken cart |
| **Throttle results recorded** | All 3 runs logged with clear pass/fail and root cause for any failure | Runs logged, root cause reasoning shallow | Runs not actually executed, or results not recorded |
| **Cross-review quality** | Specific, DOM-grounded critique of the other team's locators and assertions | General critique, correct but vague | No meaningful critique given |
| **Rubric + takeaway** | Team proposes a locator priority order with reasoning tied to today's data | Priority order given, little reasoning | No rubric produced |

**Scoring:** each criterion 1–5, total ÷ 25 × 100%.

---

*This worksheet accompanies the Seminar Report — T02 Web Automation Testing, Group 07.*