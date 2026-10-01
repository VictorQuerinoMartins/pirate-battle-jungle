import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameInput } from './gameInput';

function keyEvent(type: 'keydown' | 'keyup', code: string): Event {
  return Object.assign(new Event(type, { cancelable: true }), { code });
}

let fakeWindow: EventTarget;

beforeEach(() => {
  fakeWindow = new EventTarget();
  vi.stubGlobal('window', fakeWindow);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GameInput', () => {
  it('maps Enter to the front shot', () => {
    const input = new GameInput();
    input.attachKeyboard();

    fakeWindow.dispatchEvent(keyEvent('keydown', 'Enter'));
    expect(input.isDown('fireFront')).toBe(true);

    fakeWindow.dispatchEvent(keyEvent('keyup', 'Enter'));
    expect(input.isDown('fireFront')).toBe(false);
  });

  it('ignores keys after the keyboard is detached', () => {
    const input = new GameInput();
    input.attachKeyboard();
    input.detachKeyboard();

    fakeWindow.dispatchEvent(keyEvent('keydown', 'KeyW'));

    expect(input.isDown('forward')).toBe(false);
  });

  it('releases every action when the window loses focus', () => {
    const input = new GameInput();
    input.attachKeyboard();
    fakeWindow.dispatchEvent(keyEvent('keydown', 'KeyW'));

    fakeWindow.dispatchEvent(new Event('blur'));

    expect(input.isDown('forward')).toBe(false);
  });

  it('lets touch buttons use the same actions', () => {
    const input = new GameInput();

    input.press('fireLeft');
    expect(input.isDown('fireLeft')).toBe(true);

    input.release('fireLeft');
    expect(input.isDown('fireLeft')).toBe(false);
  });
});