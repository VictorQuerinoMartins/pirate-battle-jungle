export type Action =
  | "forward"
  | "rotateLeft"
  | "rotateRight"
  | "fireFront"
  | "fireLeft"
  | "fireRight"
  | "pause";

const KEY_BINDINGS: Record<string, Action> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyA: "rotateLeft",
  ArrowLeft: "rotateLeft",
  KeyD: "rotateRight",
  ArrowRight: "rotateRight",
  Space: "fireFront",
  KeyQ: "fireLeft",
  KeyE: "fireRight",
  Escape: "pause",
  KeyP: "pause",
};

export class GameInput {
  private readonly active = new Set<Action>();
  private enabled = true;

  press(action: Action): void {
    if (!this.enabled) return;
    this.active.add(action);
  }

  release(action: Action): void {
    this.active.delete(action);
  }

  isDown(action: Action): boolean {
    return this.active.has(action);
  }

  clear(): void {
    this.active.clear();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.clear();
  }

  // Keyboard listeners exist only while gameplay is active.
  attachKeyboard(): void {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
  }

  detachKeyboard(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    this.clear();
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (!this.enabled) return; // paused: the menu can use the keys
    const action = KEY_BINDINGS[event.code];
    if (!action) return;
    event.preventDefault();
    this.press(action);
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    const action = KEY_BINDINGS[event.code];
    if (action) this.release(action);
  };

  private onBlur = (): void => {
    this.clear();
  };
}
