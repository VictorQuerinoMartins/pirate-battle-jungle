import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameInput } from "./gameInput";

function keyEvent(type: "keydown" | "keyup", code: string): Event {
  return Object.assign(new Event(type, { cancelable: true }), { code });
}

let fakeWindow: EventTarget;

beforeEach(() => {
  fakeWindow = new EventTarget();
  vi.stubGlobal("window", fakeWindow);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GameInput", () => {
  it("maps Space to the front shot", () => {
    const input = new GameInput();
    input.attachKeyboard();

    fakeWindow.dispatchEvent(keyEvent("keydown", "Space"));
    expect(input.isDown("fireFront")).toBe(true);

    fakeWindow.dispatchEvent(keyEvent("keyup", "Space"));
    expect(input.isDown("fireFront")).toBe(false);
  });

  it("ignores presses while disabled and forgets the held keys", () => {
    const input = new GameInput();
    input.attachKeyboard();
    fakeWindow.dispatchEvent(keyEvent("keydown", "KeyW"));

    input.setEnabled(false);
    fakeWindow.dispatchEvent(keyEvent("keydown", "KeyA"));

    expect(input.isDown("forward")).toBe(false);
    expect(input.isDown("rotateLeft")).toBe(false);

    input.setEnabled(true);
    expect(input.isDown("forward")).toBe(false);
  });

  it("ignores keys after the keyboard is detached", () => {
    const input = new GameInput();
    input.attachKeyboard();
    input.detachKeyboard();

    fakeWindow.dispatchEvent(keyEvent("keydown", "KeyW"));

    expect(input.isDown("forward")).toBe(false);
  });

  it("releases every action when the window loses focus", () => {
    const input = new GameInput();
    input.attachKeyboard();
    fakeWindow.dispatchEvent(keyEvent("keydown", "KeyW"));

    fakeWindow.dispatchEvent(new Event("blur"));

    expect(input.isDown("forward")).toBe(false);
  });

  it("lets touch buttons use the same actions", () => {
    const input = new GameInput();

    input.press("fireLeft");
    expect(input.isDown("fireLeft")).toBe(true);

    input.release("fireLeft");
    expect(input.isDown("fireLeft")).toBe(false);
  });
});
