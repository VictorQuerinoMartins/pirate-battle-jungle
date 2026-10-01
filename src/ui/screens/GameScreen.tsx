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
        width: gameConfig.arena.width,
        height: gameConfig.arena.height,
        background: '#1b6ca8',
        autoStart: false, // our GameLoop decides when to draw
        
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
      if (disposed) return; // the cleanup already destroyed the app

      container.appendChild(app.canvas);
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
      console.error(error); // proper error screen comes in a later step
    });

    return () => {
      disposed = true;
      loop?.stop();
      input.detachKeyboard();
      if (initialized) app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={hostRef} />;
}