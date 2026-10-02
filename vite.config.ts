import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    // Playwright specs live in tests/e2e and run with `npm run test:e2e`.
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
  },
});