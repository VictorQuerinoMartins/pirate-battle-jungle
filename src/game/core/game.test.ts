import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { GameInput } from '../input/gameInput';
import { createGameState, updateGame } from './game';

const { speed, rotationSpeed, radius } = gameConfig.player;

describe('updateGame', () => {
  it('moves the ship forward in the direction it is facing', () => {
    const state = createGameState();
    const input = new GameInput();
    const startX = state.player.x;
    const startY = state.player.y;
    input.press('forward');

    updateGame(state, 0.5, input);

    expect(state.player.x).toBeCloseTo(startX);
    expect(state.player.y).toBeCloseTo(startY - speed * 0.5);
  });

  it('rotates at the configured speed', () => {
    const state = createGameState();
    const input = new GameInput();
    const startAngle = state.player.angle;
    input.press('rotateRight');

    updateGame(state, 0.1, input);

    expect(state.player.angle).toBeCloseTo(startAngle + rotationSpeed * 0.1);
  });

  it('covers the same distance regardless of frame rate', () => {
    const slow = createGameState();
    const fast = createGameState();
    const input = new GameInput();
    input.press('forward');

    updateGame(slow, 0.1, input); // one big step
    for (let i = 0; i < 10; i++) updateGame(fast, 0.01, input); // ten small steps

    expect(fast.player.y).toBeCloseTo(slow.player.y);
  });

  it('keeps the ship inside the arena', () => {
    const state = createGameState();
    const input = new GameInput();
    input.press('forward');

    for (let i = 0; i < 1000; i++) updateGame(state, 0.1, input);

    expect(state.player.y).toBeGreaterThanOrEqual(radius);
    expect(state.player.x).toBeGreaterThanOrEqual(radius);
  });

  it('does not move without input', () => {
    const state = createGameState();
    const input = new GameInput();
    const startX = state.player.x;
    const startY = state.player.y;

    updateGame(state, 1, input);

    expect(state.player.x).toBe(startX);
    expect(state.player.y).toBe(startY);
  });

    it('does not let the ship enter an island', () => {
    const state = createGameState();
    const input = new GameInput();
    const island = state.islands[0];
    
    state.player.x = island.x + island.radius + 100;
    state.player.y = island.y;
    state.player.angle = Math.PI;
    input.press('forward');

    for (let i = 0; i < 200; i++) updateGame(state, 0.05, input);

    const distance = Math.hypot(state.player.x - island.x, state.player.y - island.y);
    expect(distance).toBeGreaterThanOrEqual(radius + island.radius - 0.001);
  });
});