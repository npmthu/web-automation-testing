# Flakiness metrics

> Format seeded by WAT-18 (FR-07, hand-written vs AI-audited, throttled
> network). WAT-13 (below) appends FR-02/FR-08, each over 10 runs, both
> normal-network and throttled.

## WAT-18 — FR-07 Add-to-Cart, hand-written vs AI-audited, throttled network

Environment: Chromium, network emulated via CDP `Network.emulateNetworkConditions`
(`frontend-web/tests/helpers/network-throttle.js`) — ~1.6Mbps down / 750kbps up /
150ms latency (Chrome DevTools "Fast 3G"-like profile). A harsher "Slow 3G"-style
profile (500kbps/400ms) made `page.goto('/login')` itself time out under Vite dev
mode before either flow under test could even start, so it was not usable for
this comparison.

### Run 1 (first attempt, before a bug fix — see Root cause below)

| Flow | Run 1 | Run 2 | Run 3 | Avg time (passing runs) |
|---|---|---|---|---|
| Hand-written (`add-to-cart.spec.js`, Home page) | pass | pass | pass | ~28.2s |
| AI-audited (`add-to-cart.ai-audited.spec.js`, ProductDetail) | fail | fail | pass | n/a |

Hand-written: 3/3 pass. AI-audited: 1/3 pass (2 flakes) on this attempt.

### Root cause of the AI-audited flake

Both failures: `locator('h1').innerText()` threw a **strict-mode violation**
(2 elements matched) right after clicking "Xem chi tiết". The captured page
snapshot at failure time showed the app already on the loading state of
`ProductDetail` ("Đang tải..."), meaning the click *did* navigate — but the
`h1` read happened in a narrow race window where Playwright still saw Home's
two `<h1>` elements ("Danh sách sản phẩm" + "Hiển thị 5 sản phẩm"). This is a
latent bug in the AI-audited test itself (no wait for the route change before
reading the heading), not an app defect — it was likely always possible, but
became visible more often once the machine/browser had extra work to do from
network condition emulation. The hand-written flow never hits this because it
never navigates to `ProductDetail` at all (`Home.jsx`'s "Thêm vào giỏ" adds to
cart without leaving the page).

**Fix:** added `await page.waitForURL(/\/product\//)` right after the click,
before reading the `<h1>` (applied to both `add-to-cart.ai-audited.spec.js`
and `flakiness-network.spec.js`).

### Run 2 (after fix, serial `--workers=1` to remove worker-contention noise)

| Flow | Run 1 | Run 2 | Run 3 | Avg time |
|---|---|---|---|---|
| Hand-written (Home page) | pass (27.2s) | pass (27.2s) | pass (27.1s) | 27.2s |
| AI-audited (ProductDetail) | pass (27.5s) | pass (27.3s) | pass (27.4s) | 27.4s |

6/6 pass after the fix. Timing is effectively identical between the two flows
under this profile (both bottlenecked by the same throttled asset/API loads,
not by which page they visit).

## Preliminary conclusion — maintenance cost

Once both are correctly written, the hand-written and AI-audited flows are
equally stable under network stress — the throttle itself did not
differentiate them. What did differentiate them was **how much correction the
AI-derived flow needed to get there**: beyond the false-negative assertion gap
already documented in `frontend-web/tests/ai-track/assertions-diff.md`, the
audited version needed a second, independent fix — a navigation race — that
the hand-written version's simpler design (stay on one page, no client-side
route change) never exposed in the first place. The AI's design choice to
follow the scenario literally ("open the product" → `ProductDetail`) bought
it a whole extra class of flakiness that a human writing directly for
stability would likely have avoided by preferring the simpler `Home`-page
flow, as WAT-11 did.

---

## WAT-13 — FR-02 & FR-08, 10 runs each, normal-network baseline + throttled

**Test file:** `frontend-web/tests/flakiness-sweep.spec.js` · **Helper:** same
`emulateSlowNetwork` from `frontend-web/tests/helpers/network-throttle.js`
used by WAT-18 (Fast-3G-like: 1.6Mbps down / 750kbps up / 150ms latency),
toggled via a `THROTTLE=1` env var so one file produces both the throttled
runs and the normal-network baseline. Dev server (`npm run dev`), Chromium,
`--workers=1` (sequential — matches WAT-18's serial methodology, removes
worker-contention as a variable), `--retries=0`, default test timeout
(30000ms — `playwright.config.js` sets none). Each flow's steps are split
into `test.step('setup: ...')` / `test.step('run: ...')` so the reporter
records them separately (setup = login; run = the flow-specific part after
login).

### FR-02 Login — normal network

| Run | Status | Setup (ms) | Run (ms) | Total (ms) |
|---|---|---|---|---|
| 1 | passed | 758 | 423 | 1439 |
| 2 | passed | 763 | 250 | 1254 |
| 3 | passed | 706 | 435 | 1372 |
| 4 | passed | 672 | 371 | 1291 |
| 5 | passed | 734 | 304 | 1319 |
| 6 | passed | 766 | 438 | 1490 |
| 7 | passed | 986 | 722 | 2165 |
| 8 | passed | 834 | 755 | 2225 |
| 9 | passed | 1014 | 518 | 1894 |
| 10 | passed | 809 | 436 | 1534 |

**First-run vs 10th-run:** setup 758ms → 809ms, run 423ms → 436ms, total 1439ms → 1534ms, both passed.
**Flake rate: 0/10 = 0%.**

### FR-02 Login — throttled (Fast-3G-like)

| Run | Status | Setup (ms) | Run (ms) | Total (ms) |
|---|---|---|---|---|
| 1 | passed | 26771 | 564 | 27724 |
| 2 | passed | 26736 | 668 | 27927 |
| 3 | passed | 26745 | 575 | 27907 |
| 4 | passed | 26876 | 679 | 27931 |
| 5 | passed | 26787 | 597 | 27821 |
| 6 | passed | 26840 | 631 | 27746 |
| 7 | passed | 26581 | 596 | 27525 |
| 8 | passed | 26901 | 754 | 28223 |
| 9 | passed | 26796 | 1048 | 28329 |
| 10 | passed | 26795 | 703 | 27849 |

**First-run vs 10th-run:** setup 26771ms → 26795ms, run 564ms → 703ms, total 27724ms → 27849ms, both passed.
**Flake rate: 0/10 = 0%.** Setup time (dominated by the dev server's ~90 unbundled module requests loading under throttle) lands in the same ~27s range WAT-18 recorded for FR-07 under the same profile — confirms the cost is per-page-load, not flow-specific.

### FR-08 Checkout — normal network

| Run | Status | Setup (ms) | Run (ms) | Total (ms) |
|---|---|---|---|---|
| 1 | passed | 1283 | 1144 | 2764 |
| 2 | passed | 1184 | 1430 | 2926 |
| 3 | passed | 1060 | 997 | 2296 |
| 4 | passed | 965 | 1095 | 2321 |
| 5 | passed | 1356 | 1396 | 3107 |
| 6 | passed | 1171 | 1156 | 2647 |
| 7 | passed | 1085 | 998 | 2358 |
| 8 | passed | 1072 | 1167 | 2504 |
| 9 | passed | 852 | 943 | 2072 |
| 10 | passed | 1066 | 1139 | 2423 |

**First-run vs 10th-run:** setup 1283ms → 1066ms, run 1144ms → 1139ms, total 2764ms → 2423ms, both passed.
**Flake rate: 0/10 = 0%.**

### FR-08 Checkout — throttled (Fast-3G-like)

| Run | Status | Setup (ms) | Run (ms) | Total (ms) |
|---|---|---|---|---|
| 1 | **timedOut** | 27573 | 2323 | 30280 |
| 2 | passed | 27374 | 2180 | 29869 |
| 3 | passed | 27082 | 1841 | 29160 |
| 4 | passed | 26918 | 1991 | 29211 |
| 5 | passed | 27133 | 2277 | 29684 |
| 6 | **timedOut** | 27542 | 2200 | 30451 |
| 7 | passed | 27237 | 1878 | 29383 |
| 8 | passed | 27353 | 2194 | 29874 |
| 9 | passed | 27121 | 2131 | 29577 |
| 10 | passed | 27201 | 2104 | 29589 |

**First-run vs 10th-run:** setup 27573ms → 27201ms, run 2323ms → 2104ms, total 30280ms (**timedOut**) → 29589ms (**passed**) — run 1 and run 10 land on opposite sides of the flake.
**Flake rate: 2/10 = 20%.** This is the flake investigated below.

### Root-cause analysis: FR-08 checkout timeout under throttle

**Symptom:** `Error: Test timeout of 30000ms exceeded.` on 2 of 10 runs — not tied to a specific assertion; the whole test is killed once total elapsed time crosses Playwright's default 30s test timeout (unmodified in `playwright.config.js`).

**Trigger:** Running the checkout flow (login → return to Home → add to cart → cart → checkout page → confirm — 4 client/full navigations in total) under the team's standard Fast-3G-like throttle, against the Vite dev server.

**Mechanism:** The `setup: login` step alone consistently costs ~26.6–27.6s under this throttle (matches WAT-18's ~27s finding for FR-07's login step exactly — this is the fixed cost of the dev server's ~90 unbundled module requests loading under added latency, not something specific to checkout). That leaves only ~2.4–3.4s of the 30s budget for the `run` step (add to cart + 3 more page transitions + the final confirmation). The `run` step itself varies 564ms–2323ms across these 10 runs — ordinary jitter, not throttle-specific — but because `setup` already consumes ~92% of the budget, there is almost no room left to absorb that jitter. The two failing runs (#1, #6) simply landed at the high end of both ranges at once (setup 27573/27542ms + run 2323/2200ms ≈ 29.9s, right at the 30s wall) — not a distinct bug, just accumulated timing with zero margin.

**Why intermittent, not deterministic:** neither the setup range (26581–26901ms, a ~320ms spread) nor the run range (1841–2323ms, a ~480ms spread) individually gets close to failing; it's their combination on 2 of 10 runs that crosses the line. This is the same class of finding as the FR-07 concurrency flake documented in `frontend-web/metrics/flakiness.md` (see below): a fixed timeout with no headroom over the observed p95 turns ordinary run-to-run jitter into a coin flip.

**Mitigation:**
1. **Give throttled flows their own timeout**, sized with real headroom (`test.setTimeout()` at ≥1.5x the observed sequential total, e.g. ~45s for this specific flow) rather than relying on the untouched 30s default, which was never validated against a throttled, multi-page-transition flow.
2. **Reduce full-page navigations on the critical path.** `checkout.spec.js` (and this sweep's FR-08 test) calls `page.goto('/')` to return to Home after login — a full reload that re-fetches the entire unbundled module graph under dev mode, rather than a client-side route change. Swapping that for an in-app link click (as `add-to-cart.spec.js` already does, deliberately, to preserve client-side cart state) would likely cut a large slice of the ~27s setup-adjacent cost, since it avoids a second full module-graph fetch.
3. **Prefer a production build for throttled measurement** (see the dev-server-vs-build failure mode in `User_Guide.md` §6 / `Seminar_Report.md` §Part VI) — this would shrink the ~27s dev-server tax to something closer to WAT-13's FR-07 production-build baseline (~5–7s, see `frontend-web/metrics/flakiness.md`), giving checkout's multi-page flow far more real margin before any timeout matters.

### Supplementary investigation: FR-07 under concurrent load

A deeper, separate investigation into FR-07 (production build + deliberately
oversubscribed concurrency, rather than the dev-server/sequential setup
above) is documented in full in `frontend-web/metrics/flakiness.md` —
including the methodology dead-ends (dev-server navigation timeouts,
CDP-throttle determinism at low concurrency) that led to it. Headline
result: 0/10 flakes sequential vs 5/10 flakes at `--workers=10` on an
8-core machine, root-caused to shared-backend + CPU contention rather than
a timeout-margin problem specific to one flow. Kept as a separate file
since it uses a different SUT build and a different concurrency dimension
than the sweep above, and is referenced from `User_Guide.md` §6 /
`Seminar_Report.md` Part VI as a distinct failure mode.
