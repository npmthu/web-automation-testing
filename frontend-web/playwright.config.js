import { defineConfig, devices } from '@playwright/test';

// Precondition: backend must already be running + seeded separately
// (cd backend && node database.js && node server.js) — Playwright only
// manages the frontend-web dev server below, not the backend process.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // firefox/webkit out of scope — assignment only requires single-browser coverage
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
