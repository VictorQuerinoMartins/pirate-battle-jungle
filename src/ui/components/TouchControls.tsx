import type { ReactNode } from "react";
import type { Action } from "../../game/input/gameInput";

interface TouchControlsProps {
  onPress: (action: Action) => void;
  onRelease: (action: Action) => void;
  onPause: () => void;
}

interface TouchButtonProps {
  action: Action;
  label: string;
  onPress: (action: Action) => void;
  onRelease: (action: Action) => void;
  children: ReactNode;
}

const buttonStyle = {
  width: 64,
  height: 64,
  borderRadius: "50%",
  fontSize: 20,
  border: "2px solid #fff",
  background: "rgba(0, 0, 0, 0.45)",
  color: "#fff",
  touchAction: "none",
  userSelect: "none",
  WebkitUserSelect: "none",
} as const;

// One button = one action held while the finger is down. Each finger has its
// own pointer, so turning and firing at the same time works.
function TouchButton({
  action,
  label,
  onPress,
  onRelease,
  children,
}: TouchButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      style={buttonStyle}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onPress(action);
      }}
      onPointerUp={() => onRelease(action)}
      onPointerCancel={() => onRelease(action)}
      onLostPointerCapture={() => onRelease(action)}
      onContextMenu={(event) => event.preventDefault()}
    >
      {children}
    </button>
  );
}

export function TouchControls({
  onPress,
  onRelease,
  onPause,
}: TouchControlsProps) {
  const group = {
    position: "absolute",
    bottom: 16,
    display: "flex",
    gap: 12,
    alignItems: "center",
  } as const;
  const handlers = { onPress, onRelease };

  return (
    <>
      <div style={{ ...group, left: 16 }}>
        <TouchButton action="rotateLeft" label="Turn left" {...handlers}>
          ◀
        </TouchButton>
        <TouchButton action="rotateRight" label="Turn right" {...handlers}>
          ▶
        </TouchButton>
      </div>
      <div style={{ ...group, right: 16 }}>
        <TouchButton
          action="fireLeft"
          label="Fire left broadside"
          {...handlers}
        >
          L
        </TouchButton>
        <TouchButton action="fireFront" label="Fire front cannon" {...handlers}>
          ●
        </TouchButton>
        <TouchButton
          action="fireRight"
          label="Fire right broadside"
          {...handlers}
        >
          R
        </TouchButton>
        <TouchButton action="forward" label="Sail forward" {...handlers}>
          ▲
        </TouchButton>
      </div>
      <button
        type="button"
        aria-label="Pause"
        onClick={onPause}
        style={{ position: "absolute", top: 40, right: 8 }}
      >
        Pause
      </button>
    </>
  );
}