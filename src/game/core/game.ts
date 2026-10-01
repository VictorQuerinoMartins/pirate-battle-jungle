import { gameConfig } from '../config/gameConfig';
import type { GameInput } from '../input/gameInput';

export interface PlayerState {
  x: number;
  y: number;
  angle: number;
  hp: number;
}

export interface GameState {
  player: PlayerState;
}

export function createGameState(): GameState {
  const { arena, player } = gameConfig;
  return {
    player: {
      x: arena.width / 2,
      y: arena.height / 2,
      angle: -Math.PI / 2,
      hp: player.maxHp,
    },
  };
}

export function updateGame(state: GameState, dt: number, input: GameInput): void {
  const { arena, player: config } = gameConfig;
  const player = state.player;

  const turn = Number(input.isDown('rotateRight')) - Number(input.isDown('rotateLeft'));
  player.angle += turn * config.rotationSpeed * dt;

  if (input.isDown('forward')) {
    player.x += Math.cos(player.angle) * config.speed * dt;
    player.y += Math.sin(player.angle) * config.speed * dt;
  }

  player.x = clamp(player.x, config.radius, arena.width - config.radius);
  player.y = clamp(player.y, config.radius, arena.height - config.radius);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}