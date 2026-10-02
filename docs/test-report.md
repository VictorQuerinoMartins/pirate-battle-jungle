# Test report

Run on 2026-10-02 on the author's Windows machine (Chromium from Playwright).

## Commands

```bash
npm test                        # unit tests
npm run test:e2e                # end-to-end tests (builds the app and serves it on port 4173)
npx playwright show-report      # HTML report with traces for failures
```

## Results

| Suite | Result |
|---|---|
| Unit tests (Vitest) | 96 passed |
| End-to-end, desktop Chromium | 17 passed, 2 skipped (touch-only tests) |
| End-to-end, mobile Chromium (Pixel 7, landscape) | 17 passed |

## What the end-to-end tests cover

| Spec | Flows |
|---|---|
| `menu.spec.ts` | Menu with the first page of the ranking, ranking pagination, options kept after reload |
| `scenarios.spec.ts` | Empty ranking, many pages, slow responses (loading state), server error and recovery |
| `gameplay.spec.ts` | Full match to the result screen and one history entry, abandoned match not recorded, play again, API outage when the match ends and the match sent after recovery |
| `pause.spec.ts` | Pause freezes the match and resume needs a player action, automatic pause when the window loses focus |
| `touch.spec.ts` (mobile only) | Touch buttons and pause button, landscape warning when the phone is held upright |
| `visual.spec.ts` | Visual regression of the menu, a still arena and the result screen |

## How the tests stay stable

- They run against the production build, the same one that is published.
- Each test uses a fresh browser context, so `localStorage` and the service worker start empty.
- `?seed=` fixes the random generator; Playwright's fake clock freezes the animation frames; `?testControls` exposes `advance(seconds)` to play the simulation without waiting for real time.
- Visual references live in `tests/e2e/visual.spec.ts-snapshots/` (created on Windows).
- Traces are kept for failing tests (`trace: "retain-on-failure"`) and every run writes an HTML report to `playwright-report/`.