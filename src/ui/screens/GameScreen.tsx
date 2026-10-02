import { useEffect, useRef, useState } from "react";
import { Application } from "pixi.js";
import { gameConfig } from "../../game/config/gameConfig";
import { createGameState, updateGame } from "../../game/core/game";
import { GameLoop } from "../../game/core/gameLoop";
import { GameInput } from "../../game/input/gameInput";
import { Renderer } from "../../game/render/renderer";
import { loadImage, loadXmlAtlas } from "../../game/render/atlas";
import { Hud, type HudData } from "../components/Hud";
import { PauseMenu } from "../components/PauseMenu";
import type { MatchResult } from "../matchResult";
import type { GameOptions } from "../../game/core/options";

const ASSETS = `${import.meta.env.BASE_URL}assets/`;
const LOAD_STEPS = 3; // renderer started, ship atlas, tile sheet

export function GameScreen({
  options,
  onFinish,
}: {
  options: GameOptions;
  onFinish: (result: MatchResult) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [hud, setHud] = useState<HudData>({
    hp: gameConfig.player.maxHp,
    score: 0,
    secondsLeft: options.durationSeconds,
  });

  const [paused, setPaused] = useState(false);
  const loopRef = useRef<GameLoop | null>(null);
  const inputRef = useRef<GameInput | null>(null);

  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [loaded, setLoaded] = useState(0);
  const [attempt, setAttempt] = useState(0);

  // Starts the loading again: the main effect runs once more.
  function retry() {
    setLoaded(0);
    setLoadState("loading");
    setAttempt((count) => count + 1);
  }

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const container = host;

    const app = new Application();
    const input = new GameInput();
    inputRef.current = input;
    let loop: GameLoop | null = null;
    let initialized = false;
    let disposed = false;

    // Each finished download moves the progress bar one step.
    function step<T>(value: T): T {
      if (!disposed) setLoaded((count) => count + 1);
      return value;
    }

    async function start() {
      await app.init({
        resolution: window.devicePixelRatio,
        width: gameConfig.arena.width,
        height: gameConfig.arena.height,
        background: "#1b6ca8",
        autoStart: false,
      });
      initialized = true;
      if (disposed) {
        app.destroy(true, { children: true });
        return;
      }

      setLoaded(1);

      const [textures, tileSheet] = await Promise.all([
        loadXmlAtlas(
          `${ASSETS}spritesheet/ships_miscellaneous_sheet.png`,
          `${ASSETS}spritesheet/ships_miscellaneous_sheet.xml`,
        ).then(step),
        loadImage(`${ASSETS}tilesheet/tiles_sheet.png`).then(step),
      ]);
      if (disposed) return;

      container.appendChild(app.canvas);
      app.canvas.style.width = "100%";
      app.canvas.style.height = "100%";
      app.canvas.style.objectFit = "contain";
      const state = createGameState(Date.now(), options);
      const matchId = crypto.randomUUID();
      const renderer = new Renderer(app, textures, tileSheet, state);
      let finished = false;
      input.attachKeyboard();
      loop = new GameLoop({
        update: (dt) => {
          updateGame(state, dt, input);
          renderer.render(state);

          const next = {
            hp: state.player.hp,
            score: state.score,
            secondsLeft: Math.ceil(state.timeLeft),
          };
          setHud((current) =>
            current.hp === next.hp &&
            current.score === next.score &&
            current.secondsLeft === next.secondsLeft
              ? current
              : next,
          );

          if (state.status === "over" && !finished) {
            finished = true;
            onFinish({
              matchId,
              playedAt: new Date().toISOString(),
              config: options,
              score: state.score,
              secondsPlayed: Math.round(
                options.durationSeconds - state.timeLeft,
              ),
              reason: state.player.hp === 0 ? "destroyed" : "time",
            });
          }
        },
      });

      loop.start();
      loopRef.current = loop;
      setLoadState("ready");
    }

    start().catch((error: unknown) => {
      console.error(error);
      if (!disposed) setLoadState("error");
    });

    return () => {
      disposed = true;
      loop?.stop();
      input.detachKeyboard();
      inputRef.current = null;
      if (initialized) app.destroy(true, { children: true });
    };
  }, [onFinish, options, attempt]);

  // Pause or resume the game loop whenever `paused` changes. While paused the
  // input forgets held keys and ignores new ones, so nothing pressed during
  // the pause is applied after resuming.
  useEffect(() => {
    loopRef.current?.setPaused(paused);
    inputRef.current?.setEnabled(!paused);
  }, [paused]);

  // Esc / P toggle the pause; losing focus pauses automatically.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code === "Escape" || event.code === "KeyP") {
        setPaused((current) => !current);
      }
    };
    const pause = () => setPaused(true);
    const onVisibilityChange = () => {
      if (document.hidden) setPaused(true);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={hostRef} style={{ width: "100%", height: "100%" }} />
      {loadState === "ready" && <Hud data={hud} />}
      {loadState === "loading" && (
        <div
          role="status"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            color: "#fff",
          }}
        >
          <p style={{ margin: 0 }}>Loading game...</p>
          <progress
            value={loaded}
            max={LOAD_STEPS}
            aria-label="Loading progress"
          />
        </div>
      )}
      {loadState === "error" && (
        <div
          role="alert"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            color: "#fff",
          }}
        >
          <p style={{ margin: 0 }}>Could not load the game assets.</p>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}
      {paused && <PauseMenu onResume={() => setPaused(false)} />}
    </div>
  );
}
