import { useEffect, useRef, useSyncExternalStore } from "react";
import { sound } from "../../audio/sound";
import { SpriteButton } from "./SpriteButton";

export function PauseMenu({ onResume }: { onResume: () => void }) {
  const resumeRef = useRef<HTMLButtonElement>(null);
  const muted = useSyncExternalStore(sound.subscribe, sound.isMuted);

  useEffect(() => {
    resumeRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      className="overlay"
    >
      <div className="sprite f-panel card scale-md">
        <h2 id="pause-title" className="card-title">
          Paused
        </h2>
        <SpriteButton ref={resumeRef} onClick={onResume}>
          Resume
        </SpriteButton>
        <SpriteButton
          variant="secondary"
          aria-pressed={!muted}
          onClick={() => sound.setMuted(!muted)}
        >
          {muted ? "Sound: Off" : "Sound: On"}
        </SpriteButton>
      </div>
    </div>
  );
}