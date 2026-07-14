# Flakiness metrics

> Format seeded by WAT-18 (FR-07, hand-written vs AI-audited, throttled
> network). WAT-13 should append rows for FR-02/FR-08 and the full 10-run
> normal-network baseline using the same columns.

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
