import { useEffect, useRef } from "react";
import { SpriteButton } from "./SpriteButton";

export function PauseMenu({ onResume }: { onResume: () => void }) {
  const resumeRef = useRef<HTMLButtonElement>(null);

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
      </div>
    </div>
  );
}