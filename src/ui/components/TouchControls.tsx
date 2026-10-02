import type { Action } from "../../game/input/gameInput";

interface TouchControlsProps {
  onPress: (action: Action) => void;
  onRelease: (action: Action) => void;
  onPause: () => void;
}

interface TouchButtonProps {
  action: Action;
  label: string;
  icon: string;
  onPress: (action: Action) => void;
  onRelease: (action: Action) => void;
}

// One button = one action held while the finger is down. Each finger has its
// own pointer, so turning and firing at the same time works.
function TouchButton({
  action,
  label,
  icon,
  onPress,
  onRelease,
}: TouchButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="btn-round touch-btn"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onPress(action);
      }}
      onPointerUp={() => onRelease(action)}
      onPointerCancel={() => onRelease(action)}
      onLostPointerCapture={() => onRelease(action)}
      onContextMenu={(event) => event.preventDefault()}
    >
      <span className={`sprite ${icon}`} aria-hidden="true" />
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
    bottom: 20,
    display: "flex",
    gap: 14,
    alignItems: "center",
  } as const;
  const handlers = { onPress, onRelease };

  return (
    <>
      <div style={{ ...group, left: 20 }}>
        <TouchButton
          action="rotateLeft"
          label="Turn left"
          icon="f-icon-turn-left"
          {...handlers}
        />
        <TouchButton
          action="rotateRight"
          label="Turn right"
          icon="f-icon-turn-right"
          {...handlers}
        />
      </div>
      <div style={{ ...group, right: 20 }}>
        <TouchButton
          action="fireLeft"
          label="Fire left broadside"
          icon="f-icon-fire-left"
          {...handlers}
        />
        <TouchButton
          action="fireFront"
          label="Fire front cannon"
          icon="f-icon-fire-front"
          {...handlers}
        />
        <TouchButton
          action="fireRight"
          label="Fire right broadside"
          icon="f-icon-fire-right"
          {...handlers}
        />
        <TouchButton
          action="forward"
          label="Sail forward"
          icon="f-icon-forward"
          {...handlers}
        />
      </div>
      <button
        type="button"
        aria-label="Pause"
        className="btn-round touch-pause"
        onClick={onPause}
      >
        <span className="sprite f-icon-pause" aria-hidden="true" />
      </button>
    </>
  );
}