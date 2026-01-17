// ===================
// Client & Player Types
// ===================

export type ClientType = 'host' | 'player';

export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export const PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  isConnected: boolean;
}

// Game phase
export type GamePhase = 'lobby' | 'playing' | 'finished';

