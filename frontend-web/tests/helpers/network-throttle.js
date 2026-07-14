// Shared network-throttle helper (Chromium/CDP only).
// Reused by WAT-18 here and intended for WAT-13's broader flakiness sweep.
//
// Profile ~= Chrome DevTools "Fast 3G". A harsher "Slow 3G"-style profile
// (500kbps/400ms) timed out page.goto('/login') outright under Vite dev mode
// (many unbundled module requests) before the flow under test even started,
// so this is the harshest profile that still lets the SPA finish loading.
export async function emulateSlowNetwork(page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8, // ~1.6Mbps
    uploadThroughput: (750 * 1024) / 8, // ~750kbps
    latency: 150, // ms
  });
}
