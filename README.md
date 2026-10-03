# Pirate Battle

A 2D top-down naval shooter built for the Jungle Gaming technical test. You sail a ship around an arena with islands, sink enemy ships, and compete in a ranking served by a mocked API.

**Live demo:** https://pirate-battle-jungle.vercel.app/ · **Repository:** https://github.com/VictorQuerinoMartins/pirate-battle-jungle

Stack: React, TypeScript (strict), PixiJS, TanStack Query, Axios, MSW, Playwright, Vite, Vitest.

## Setup

Requirements: Node.js 20.19 or newer.

```bash
npm install
npx playwright install chromium   # only needed for the E2E and performance tests
npm run dev
```

### Environment variables

None are required. Assets are loaded relative to Vite's `BASE_URL`, the API client uses the fixed base path `/api`, and the mock API (MSW) starts in every build, including the published one, because the brief asks for the mocks to work in production.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Type check (`tsc -b`) and production build into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | ESLint |
| `npx tsc -b` | Type check only |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright, desktop and mobile Chromium) |
| `npx playwright show-report` | Opens the HTML report of the last E2E run (traces included) |
| `npx playwright test --update-snapshots` | Recreates the visual regression images |
| `npm run perf` | Performance measurements, headless |
| `npm run perf -- --headed` | Performance measurements with a real window (keep it in front) |

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Sail forward | `W` or `Arrow Up` | Sail forward button |
| Turn left / right | `A` / `D` or `Arrow Left` / `Arrow Right` | Turn left / Turn right buttons |
| Front cannon (1 shot) | `Space` | Fire front cannon button |
| Left / right broadside (3 parallel shots) | `Q` / `E` | L / R buttons |
| Pause / resume | `Esc` or `P` | Pause button |

Touch controls appear on touch devices. The supported orientation is **landscape**: held upright, the game pauses and asks you to rotate the device. Keys are captured only during a match, so menus keep normal keyboard navigation.

**Mobile tip.** On Android and iPad, tapping Play asks the browser for fullscreen. iPhone Safari does not allow that for web pages, so add the game to the Home Screen (Share, then Add to Home Screen) to play without the browser bars.

## How the game works

- A match lasts between 60 and 180 seconds of **active** play (the clock stops while paused).
- You score 1 point for each enemy you destroy. A Chaser that crashes into your ship does not give points.
- **Chaser:** chases the ship, damages it on contact and explodes.
- **Shooter:** approaches until it is in range, stops and fires at the ship. Its shots are blocked by islands.
- Both enemy types respect islands. Enemies appear at safe points: free of islands and far from the player.
- The match ends when time runs out or the ship is destroyed. Ending stops movement, attacks, damage, spawns and score.
- The game pauses by itself when the window loses focus or the tab is hidden. Resuming needs a player action, and nothing pressed during the pause is applied afterwards.
- Feedback: shot flashes, hit sparks, explosions, health bars over every ship, and ship sprites that deteriorate as health drops.

### Options

| Option | Range | Default |
|---|---|---|
| Session time | 60 to 180 s, step 10 | 120 s |
| Enemy spawn interval | 1 to 10 s, step 1 | 3 s |

Options are validated, saved in the browser and read once when a match starts. The ranking only compares matches that used the same options.

### Gameplay configuration

All values live in `src/game/config/gameConfig.ts`.

| Group | Value |
|---|---|
| Arena | 1280 x 720, 3 islands |
| Player | 100 HP, speed 220 px/s, turn speed 3 rad/s, radius 20 |
| Player weapons | front: 400 ms cooldown; broadside: 1000 ms cooldown, 3 shots 14 px apart (each weapon has its own cooldown) |
| Projectile | speed 500 px/s, damage 10, lifetime 1.5 s |
| Chaser | 30 HP, speed 110 px/s, contact damage 10 |
| Shooter | 20 HP, speed 80 px/s, range 320 px, fires every 1.5 s, shot damage 5, contact damage 10 |
| Spawn | default every 3 s, at most 8 enemies, at least 300 px from the player, 30% Shooters |
**Fort cannon (extra).** When the score reaches 5, the cannon in the fort on the left island wakes up and fires a slow shot at the player every 3 seconds (8 damage, range 460 px, dodgeable). The fort cannot be destroyed and its shots never score points. Its values are in `gameConfig.fort`.

## Mock API (MSW) and failure scenarios

The ranking and match history come from a mocked REST API (`GET /api/ranking`, `GET /api/history`, `POST /api/matches`) served by MSW in the browser. The same handlers are used by development, tests and the published demo. Matches registered in this browser are kept in `localStorage`; other players are fixed fixtures.

**Choosing a scenario:** open the "Mock API scenarios" section at the bottom of the main menu and pick one, or add `?scenario=<id>` to the URL. The choice made in the menu is remembered. **Reset mock data** clears the matches registered in this browser and the pending matches, then reloads.

| Scenario id | Behavior |
|---|---|
| `normal` | Everything works |
| `empty` | Ranking and history are empty |
| `many-pages` | 150 extra players: 18 ranking pages |
| `slow` | Every response takes 2.5 s |
| `variable-latency` | Each response takes between 0.2 s and 3 s |
| `out-of-order` | Alternate responses are slow (2.5 s) and fast (0.1 s) |
| `timeout` | Requests never answer (the client gives up after 5 s) |
| `network-error` | Connection failure on every request |
| `client-error` | HTTP 400 on every request |
| `server-error` | HTTP 500 on every request |
| `read-failure` | Ranking and history fail with 500; registering a match works |
| `write-outage` | Registering a match fails with a connection error; reading works |
| `timeout-after-register` | The server saves the match but never answers |

### Reproducing the failures

| Failure | Steps | What you should see |
|---|---|---|
| Ranking or history cannot load | Pick `read-failure` (or `server-error`) and open the menu | An error message with a **Try again** button; after picking `normal`, Try again loads the data |
| Loading and slow responses | Pick `slow` | A loading state, then the table |
| Empty data | Pick `empty` | "No matches yet..." and "You have not finished any match yet." |
| Many pages | Pick `many-pages` | "Page 1 of 18" and working Previous / Next |
| Outage when the match ends | Pick `write-outage`, play a match | The result screen says the match could not be saved and will be sent again. Pick `normal` and reload the page: the match is sent and appears once in the history |
| Timeout after registering | Pick `timeout-after-register`, play a match | The save fails after about 15 s, but the server already has the match. Pick `normal` and reload: the match is sent again with the same id and the history still has one entry |
| Out-of-order responses | Pick `out-of-order` and change pages quickly | The page you are looking at is never replaced by an older response |

## Testing

- **Unit tests:** `npm test` (96 tests): rules, input, options, ranking, storage, mock handlers and scenarios.
- **End-to-end tests:** `npm run test:e2e` (Chromium desktop and a mobile profile in landscape). They run against the production build and cover the menu, ranking, options, MSW scenarios, a full match to the result and history, abandoned matches, play again, API outage with recovery, pause, touch controls and visual regression.
- **Reproducible matches:** `?seed=<number>` fixes the random generator, and `?testControls` exposes `window.__pirateBattle.advance(seconds)` so the tests control the simulation clock. Together with Playwright's fake clock, a 60 s match runs in milliseconds. Every test starts in a fresh browser context, so no state is shared.
- **Visual regression:** menu, a still arena and the result screen. The reference images in `tests/e2e/visual.spec.ts-snapshots/` were created on Windows (`-win32` in the file names). On another operating system run `npx playwright test --update-snapshots` first.
- **Reports:** `docs/test-report.md`. The HTML report and traces are produced by every E2E run (`npx playwright show-report`).

## Performance

Measured with `npm run perf -- --headed` (full details in `docs/performance-report-headed.md`):

| Metric | Result |
|---|---|
| Average FPS over 180 s of play | 143.7 (the screen runs at 144 Hz; target is 60) |
| p95 / p99 frame time | 7.1 ms / 7.1 ms |
| Frames slower than 33.3 ms | 0% |
| JS heap after 5 start/play/exit cycles | 5.8 MB to 9.3 MB, no canvas left behind |

Hardware: Intel Core i7-11800H, 15.8 GB RAM, Intel UHD Graphics, Chromium 153, 1280x720. Entity counts are low (average 5.4, peak 13) because the scripted pilot is destroyed after about 14 s, so the run is a sequence of short matches that add up to 180 s.

## Deployment

The project deploys to Vercel from the `main` branch (build command `npm run build`, output `dist`). The mock service worker (`public/mockServiceWorker.js`) is part of the published build.

## Use of AI tools

This project was built with Claude (Anthropic) as a pair-programming assistant. The assistant proposed small steps and code; the author applied each change by hand, read it, and checked it with the linter, the type checker, the unit tests and the E2E tests before committing. The author chose the scope, the order of the work, the branch-per-feature workflow and what to keep or change. The study notes that explain every step are kept privately.

## More documentation

- `ARCHITECTURE.md`: layers, simulation, collisions, resources, persistence, ranking, balancing and known limitations.
- `docs/test-report.md` and `docs/performance-report-*.md`: test and profiling reports.
- `docs/asset-credits.md`: sources and licenses of the assets.