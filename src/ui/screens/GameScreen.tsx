import { useEffect, useRef } from 'react';
import { Application } from 'pixi.js';
import { gameConfig } from '../../game/config/gameConfig';

export function GameScreen() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const app = new Application();
    let initialized = false;
    let disposed = false;

    async function start() {
      await app.init({
        width: gameConfig.arena.width,
        height: gameConfig.arena.height,
        background: '#1b6ca8',
      });
      initialized = true;

      if (disposed) {
        app.destroy(true, { children: true });
        return;
      }

      host!.appendChild(app.canvas);
    }
    void start();

    return () => {
      disposed = true;
      if (initialized) app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={hostRef} />;
}