import { defineConfig, devices } from "@playwright/test";

const PORT = 4174;

// Performance measurements: one worker, a big timeout, and flags so the page
// can read the JS heap size and ask for a garbage collection.
// Run with `npm run perf` (headless) or `npm run perf -- --headed`.
export default defineConfig({
  testDir: "./tests/perf",
  workers: 1,
  timeout: 15 * 60_000,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      args: ["--enable-precise-memory-info", "--js-flags=--expose-gc"],
    },
  },
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});