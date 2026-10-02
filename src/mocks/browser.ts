import { setupWorker } from "msw/browser";
import { createMatchDb } from "./db";
import { createFixtureRecords } from "./fixtures";
import { createHandlers } from "./handlers";

function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

const db = createMatchDb(createFixtureRecords(25), browserStorage());

export const worker = setupWorker(...createHandlers(db));