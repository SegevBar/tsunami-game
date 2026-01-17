// Re-export all types from their respective modules
export * from './session/types';
export * from './game/types';
export * from './socket/events';

// ===================
// Factory Functions
// ===================

import { GameSession } from './socket/events';

export const createInitialSession = (): GameSession => ({
  hostConnected: false,
  players: [],
  phase: 'lobby',
  minPlayers: 2,
  maxPlayers: 5,
  gameState: null,
});
