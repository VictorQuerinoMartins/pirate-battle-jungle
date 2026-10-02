import { describe, expect, it } from "vitest";
import { formatTime } from "./formatTime";

describe("formatTime", () => {
  it("formats seconds as m:ss", () => {
    expect(formatTime(120)).toBe("2:00");
    expect(formatTime(65)).toBe("1:05");
  });

  it("never shows a negative time", () => {
    expect(formatTime(-3)).toBe("0:00");
  });
});