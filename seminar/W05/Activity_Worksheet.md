# Activity Worksheet — "Locator Brawl: Hand-crafted vs AI-suggested"

**Seminar:** T02 — Web Automation Testing · Group 07
**SUT:** EShop (React + Node.js/Express) — flow: Login → Add-to-Cart → assert cart badge
**Duration:** 25 minutes (0:00–0:25)

> **Before you start:** figure out whether your team is **Team A** or **Team B** (assigned by the facilitator). Both teams use this same worksheet — only Section 3A / 3B differs.

---

## 1. Learning Objectives

By the end of the activity, each team should be able to answer (drawn from your own hands-on data, not memorized):

1. Which locators hold up better across 3 runs on a slow network — hand-written or AI-suggested?
2. What kind of locator does AI tend to pick (role/text vs CSS/XPath) when the page lacks `data-test-id`?
3. What order should a "good locator" rubric prioritize?

---

## 2. Timeline

| Time | Step | What Team A does | What Team B does |
|---|---|---|---|
| 0:00–0:03 | Facilitator demos the target flow on EShop: login → add to cart → assert badge | Observe | Observe |
| 0:03–0:10 | Write the test | Write it by hand in Playwright | Use Copilot/Claude to generate a test for the same flow |
| 0:10–0:15 | Run the test 3 times on a throttled "Slow 4G" network, record results | Fill in **Table 3A** | Fill in **Table 3B** |
| 0:15–0:20 | Swap worksheets with the other team, cross-review | Fill in **Table 4** | Fill in **Table 4** |
| 0:20–0:25 | Whole class agrees on a "good locator" rubric on the whiteboard | Fill in **Table 5** | Fill in **Table 5** |

---

## 3A. If you're **Team A** (Hand-crafted) — fill in this section

**Locator used for each step** (e.g. `getByLabel('Email')`, `#login-btn`, `.cart-badge`):

| Step in flow | Locator used | Type (role/label/text/testid/css-xpath) |
|---|---|---|
| Enter email | | |
| Enter password | | |
| Click Login button | | |
| Click Add to cart | | |
| Assert cart badge | | |

**Results across 3 runs (Slow 4G):**

| Run | Pass/Fail | Which locator broke (if any) | Reason for failure |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**Time to write the test (minutes):** _____
**Number of times you had to fix a locator after writing it:** _____

---

## 3B. If you're **Team B** (AI-suggested) — fill in this section

**Prompt used for the AI (copy verbatim):**

```
______________________________________________
```

**Locator suggested by AI for each step:**

| Step in flow | AI-suggested locator | Type (role/label/text/testid/css-xpath) | Does it actually exist on the page? |
|---|---|---|---|
| Enter email | | | |
| Enter password | | | |
| Click Login button | | | |
| Click Add to cart | | | |
| Assert cart badge | | | |

**Results across 3 runs (Slow 4G):**

| Run | Pass/Fail | Which locator broke (if any) | Reason for failure |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**Time from prompt to a running test (minutes):** _____
**Number of locators you had to fix by hand after AI generation:** _____
**Did the AI "invent" a locator that doesn't exist?** (yes/no, give details) _____

---

## 4. Cross-review (both teams fill this in, after swapping worksheets)

- Does the other team's locator use a semantic attribute (role/label/text), or does it rely on position (CSS index, absolute XPath)?
- If EShop's UI changes slightly (class name renamed, field order changed), which of the other team's locators is most likely to break?
- Overall stability score (1–5, 5 = most stable): Team A ___ / Team B ___

---

## 5. Good Locator Rubric (whole class agrees together, write on the whiteboard)

Priority order, highest to lowest:

1. ___________________________
2. ___________________________
3. ___________________________
4. ___________________________

---

*This worksheet accompanies the Seminar Report — T02 Web Automation Testing, Group 07.*