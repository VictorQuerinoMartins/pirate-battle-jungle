import { setupWorker } from "msw/browser";
import { createMatchDb } from "./db";
import { createFixtureRecords } from "./fixtures";
import { createHandlers } from "./handlers";
import { initScenario } from "./scenarios";

function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

const storage = browserStorage();
const db = createMatchDb(createFixtureRecords(25), storage);

initScenario(storage);

export const worker = setupWorker(...createHandlers(db));

// Forgets the matches registered in this browser.
export function resetMockData(): void {
  db.reset();
}