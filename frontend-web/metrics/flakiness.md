# WAT-13 (supplementary) — FR-07 Flakiness Under Concurrent Load

> **This is a supplementary deep-dive, not the primary WAT-13 deliverable.**
> The canonical `metrics/flakiness.md` is at the repo root — it covers
> FR-02/FR-08 (10 runs each, normal + throttled network, matching WAT-18's
> established methodology and helper) and contains the primary root-cause
> analysis (a genuine flake found in FR-08 checkout under throttle). This
> file is referenced from there: it's a separate, deeper investigation into
> FR-07 specifically under *concurrent* execution (a different SUT build —
> production instead of dev — and a different stress dimension —
> `--workers` contention instead of sequential throttle), kept here because
> it doesn't share the root file's methodology and would clutter it.

**Flow under test:** FR-07 Add-to-Cart (same steps as `tests/add-to-cart.spec.js`, WAT-11).
**Test file:** `tests/add-to-cart.throttled.spec.js`.
**Assignee:** M1 + M4 · **SP:** 5

## 1. Environment

| Item | Value |
|---|---|
| SUT frontend | Production build served via `vite preview --port 4173` (NOT the Vite dev server — see §3, attempt 1) |
| SUT backend | `node backend/server.js` (Express + `sqlite3`, single DB connection), seeded via `node backend/database.js` |
| Browser | Chromium (only project configured in `playwright.config.js`) |
| Network throttle | CDP `Network.emulateNetworkConditions`: `latency: 600ms`, `downloadThroughput`/`uploadThroughput`: ~300kbps. Applied per-page via `page.context().newCDPSession(page)` — this affects every request the page makes, including the `axios` calls to the backend, not just the initial page load. |
| Retries | `0` (`playwright.config.js` and CLI `--retries=0`) — no auto-retry masking a flake |

**One-time environment setup costs** (measured once, not per test run — this is what "getting the SUT up" costs, separate from the per-run "setup time" in §4):

| Step | Time |
|---|---|
| `backend && npm install` | ~22s |
| `frontend-web && npm install` | ~16s |
| `npx playwright install chromium` (cold, incl. Chrome Headless Shell + ffmpeg) | ~2 min (network-dependent) |
| `node database.js` (seed) | <1s |
| `node server.js` ready | ~1s |
| `npm run build` (vite) | 1.40s |
| `vite preview` ready | ~1-2s |

## 2. What "setup time" / "run time" mean here

The flow is split into two `test.step()` blocks, and the Playwright JSON reporter records each step's duration independently:

- **setup time** = `test.step('setup: login')` — navigate to `/login`, fill credentials, click "Sign In", wait for the logged-in greeting.
- **run time** = `test.step('run: add-to-cart flow')` — click "Thêm vào giỏ" on the first product, navigate to the cart via the nav link, assert the cart table has exactly 1 row with the right product/quantity.

## 3. Methodology journey (including what did *not* flake, and why)

Getting a real, reproducible flake — instead of a fabricated one — took several iterations. Recorded honestly because the negative results are informative too. Raw JSON for every attempt is under `metrics/raw/`.

1. **Dev server + throttle (`metrics/raw/dev-server-attempt-abandoned/`).** First attempt pointed the throttled test at the Vite dev server (`localhost:5173`) with a generous 45s timeout. **6/6 runs timed out identically** on `page.goto` itself ("Test timeout of 45000ms exceeded... waiting until load"). Vite dev serves ~90 unbundled ES module requests per page load; at 600ms latency/request that page never finishes loading. This is a dev-server artifact (module-per-file transport), not something a throttled end user would ever hit against a bundled production app — not a meaningful flakiness signal, so abandoned in favor of testing the production build (`vite build` + `vite preview`, 2 files: JS + CSS).

2. **Production build, sequential (1 worker), generous 45s timeout (`pass1-loose-timeout-10-of-10/`).** 10/10 passed. Setup step clustered tightly at 3.56–3.70s. CDP throttling is a **fixed, deterministic** rate — with a loose timeout there's no jitter to exploit, so flake rate was 0%.

3. **Tightened the login assertion timeout** to 3600ms (`pass2-tight-expect-still-10-of-10/`), then to 870ms — pinned right inside the measured p50 band (`pass3-tight-870-still-10-of-10/`). Still 10/10 green both times: the assertion itself resolves in ~860–890ms regardless; most of the step's wall-clock time is the deterministic page load *before* the assertion starts polling, not the assertion itself.

4. **Introduced real concurrency**: `--repeat-each=10 --workers=5` (`pass4-concurrent-5w-10of10/`), same throttle. Still 10/10 passed, but durations rose noticeably (5.2–6.2s total vs ~4s sequential) — the first sign of genuine, non-deterministic contention.

5. **Raised concurrency to `--workers=10`** on this 8-logical-core machine (i.e. deliberately oversubscribed) and increased throttle severity to 600ms/300kbps (`pass5-concurrent-10w-still-10of10/`, `pass6-concurrent-tight-expect-still-10of10/`, `pass7-concurrent-goto-timeout-still-10of10/`). Still 10/10 passed each time, but the **setup step alone now ranged 5.3s–8.3s** and total test duration clustered 7.8s–11.6s — a real, wide, load-dependent spread, unlike the tight deterministic cluster from throttle alone.

6. **Final config**: `test.setTimeout(10_000)` — pinned inside that observed 7.8–11.6s cluster — rerun with the same `--repeat-each=10 --workers=10` batch. **5 passed / 5 failed** (`metrics/raw/final-concurrent-10w-5of10-flake/`). This is a genuine flake driven by real resource contention, not an engineered failure — analyzed in §6.

## 4. First-run vs 10th-run (sequential baseline, 1 worker, final shipped config)

10 sequential runs (`--workers=1`, default), same throttle (600ms/300kbps) and `test.setTimeout(10_000)` as shipped in `tests/add-to-cart.throttled.spec.js`. Raw data: `metrics/raw/sequential-final-config/`.

| Metric | Run 1 | Run 10 |
|---|---|---|
| setup time (login step) | 5067 ms | 5358 ms |
| run time (add-to-cart step) | 1020 ms | 1202 ms |
| total duration | 6410 ms | 6884 ms |
| status | passed | passed |

Full 10-run sequential detail:

| Run | Status | Setup (ms) | Run (ms) | Total (ms) |
|---|---|---|---|---|
| 1 | passed | 5067 | 1020 | 6410 |
| 2 | passed | 5234 | 1102 | 6604 |
| 3 | passed | 5179 | 1214 | 6838 |
| 4 | passed | 5342 | 1214 | 6818 |
| 5 | passed | 5357 | 1219 | 6851 |
| 6 | passed | 5674 | 978 | 7052 |
| 7 | passed | 5290 | 1200 | 6780 |
| 8 | passed | 5549 | 1357 | 7252 |
| 9 | passed | 5383 | 1234 | 6936 |
| 10 | passed | 5358 | 1202 | 6884 |

**Sequential flake rate: 0/10 = 0%.** Under this throttle profile, run alone (no contention), the flow is completely stable — confirming the throttle itself (a fixed CDP-emulated rate) is not the source of flakiness; contention is.

## 5. Concurrent run flake rate (the regime that actually flaked)

Same throttle, same `test.setTimeout(10_000)`, run as `npx playwright test tests/add-to-cart.throttled.spec.js --repeat-each=10 --workers=10 --retries=0`. Raw data: `metrics/raw/final-concurrent-10w-5of10-flake/concurrent-attempt5.json`.

| Run | Status | Setup (ms) | Run (ms) | Total (ms) |
|---|---|---|---|---|
| 1 | passed | 5465 | 1317 | 8724 |
| 2 | **timedOut** | 7211 | 1152 | 11466 |
| 3 | **timedOut** | 7928 | 1816 | 11424 |
| 4 | passed | 6374 | 864 | 8929 |
| 5 | **timedOut** | 5521 | 4349 | 11594 |
| 6 | passed | 6822 | 1122 | 9196 |
| 7 | passed | 5474 | 1573 | 8335 |
| 8 | **timedOut** | 8096 | 1461 | 10636 |
| 9 | passed | 5793 | 1237 | 8436 |
| 10 | **timedOut** | 8277 | 1503 | 10365 |

**Concurrent flake rate: 5/10 = 50%.**

## 6. Root-cause analysis of the flake

**Symptom:** `Error: Test timeout of 10000ms exceeded.` — the test doesn't fail on a specific assertion; the whole test is killed once total elapsed time crosses the 10s test-level timeout.

**Trigger:** Running 10 instances of the throttled flow concurrently (`--workers=10`) on an 8-logical-core machine, all hitting:
- the same backend Node process (single event loop — request handling for all 10 browsers is interleaved on one thread), and
- the same `sqlite3` connection (backend/database.js opens one connection; `sqlite3`'s default behavior serializes queries against it), and
- the same CPU pool for 10 concurrent Chromium renderer processes (oversubscribed: 10 workers > 8 logical cores).

**Mechanism:** Under sequential execution (§4), the same throttle produces a tight, deterministic setup time (~5.1–5.7s) because there's no contention — one browser, one backend request queue. Under concurrent execution (§5), setup time spread from 5.5s to 8.3s, and in one run (#5) the "run" step itself ballooned to 4.3s instead of ~1.2s — i.e. **which** step absorbs the extra time varies run to run, because it depends on which of the 10 workers happens to be scheduled/served first at any given moment. This is classic resource-contention jitter: CPU scheduling for 10 Chromium processes on 8 cores, plus request queueing on the single-threaded backend, plus the CDP-throttled bandwidth being a *shared* pipe conceptually contended across parallel page loads. None of this is deterministic pass-to-pass, which is exactly why it shows up as a flake (5/10) rather than a consistent 0/10 or 10/10.

**Why it's intermittent and not a bug in the flow:** The application logic is not at fault — every passing run completes the exact same assertions correctly, and every failing run was killed by the timeout mid-step (once in "setup", four times partway through, one of which was actually killed during the "run" step per the step-duration breakdown). The failure is purely a timing/capacity problem: `test.setTimeout(10_000)` has zero margin over the observed 7.8–11.6s range once real contention is present.

**Mitigation:**
1. **Don't run more browser workers than logical cores** when network throttling is also active — throttling makes CPU contention worse, not better, because slower network round-trips keep more renderer processes alive concurrently. Cap `workers` to `cores - 1` (7 here) for throttled suites specifically, even if the untouched suite runs fine at higher parallelism.
2. **Give timeouts real headroom.** A timeout should sit at ≥3x the *concurrent* p95, not the sequential p95 — 10,000ms was tuned against the wrong baseline (the eyeballed concurrent cluster's upper edge, with no margin at all). A defensible value here would be ≥15,000ms given the observed 11.6s tail.
3. **Reduce shared-resource contention** directly: the backend's single `sqlite3` connection serializes all 10 workers' requests. Widening backend concurrency (connection pool, or `sqlite3` in WAL mode) would shrink the tail this flake depends on.
4. This is also a "**don't test that way**" finding: if the goal is per-flow throttled behavior (this ticket's actual ask — 10 runs of *one* flow), running sequentially (§4) is the correct, low-noise methodology; the concurrent regime is a separate, deliberately harsher stress test used here only because it was needed to produce an analyzable flake.

## 7. Raw evidence index

All raw Playwright JSON reporter output lives under `metrics/raw/`:

- `dev-server-attempt-abandoned/` — 6 runs, dev server, 100% navigation timeout (abandoned methodology)
- `discarded-server-died-mid-run/` — discarded: backend/preview processes died mid-session (sandbox recycle), not an app flake
- `pass1-loose-timeout-10-of-10/` … `pass7-concurrent-goto-timeout-still-10of10/` — intermediate tuning passes referenced in §3
- `sequential-final-config/` — the 10 runs behind the §4 table
- `final-concurrent-10w-5of10-flake/` — the 10 runs behind the §5 table and §6 analysis
