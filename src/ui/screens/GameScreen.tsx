import { useEffect, useRef } from 'react';
import { Application } from 'pixi.js';
import { gameConfig } from '../../game/config/gameConfig';
import { createGameState, updateGame } from '../../game/core/game';
import { GameLoop } from '../../game/core/gameLoop';
import { GameInput } from '../../game/input/gameInput';
import { Renderer } from '../../game/render/renderer';
import { loadImage, loadXmlAtlas } from '../../game/render/atlas';

const ASSETS = `${import.meta.env.BASE_URL}assets/`;

export function GameScreen() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
        const host = hostRef.current;
    if (!host) return;
    const container = host;

    const app = new Application();
    const input = new GameInput();
    let loop: GameLoop | null = null;
    let initialized = false;
    let disposed = false;

    async function start() {
      await app.init({
        resolution: window.devicePixelRatio,
        width: gameConfig.arena.width,
        height: gameConfig.arena.height,
        background: '#1b6ca8',
        autoStart: false,
        
      });
      initialized = true;
      if (disposed) {
        app.destroy(true, { children: true });
        return;
      }

      const [textures, tileSheet] = await Promise.all([
        loadXmlAtlas(
          `${ASSETS}spritesheet/ships_miscellaneous_sheet.png`,
          `${ASSETS}spritesheet/ships_miscellaneous_sheet.xml`,
        ),
        loadImage(`${ASSETS}tilesheet/tiles_sheet.png`),
      ]);
      if (disposed) return;

      container.appendChild(app.canvas);
      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';
      app.canvas.style.objectFit = 'contain';
      const state = createGameState();
      const renderer = new Renderer(app, textures, tileSheet, state);

      input.attachKeyboard();
      loop = new GameLoop({
        update: (dt) => {
          updateGame(state, dt, input);
          renderer.render(state);
        },
      });
      loop.start();
    }

    start().catch((error: unknown) => {
      console.error(error);
    });

    return () => {
      disposed = true;
      loop?.stop();
      input.detachKeyboard();
      if (initialized) app.destroy(true, { children: true });
    };
  }, []);

    return <div ref={hostRef} style={{ width: '100%', height: '100%' }} />;
}