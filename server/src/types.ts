// Client types
export type ClientType = 'host' | 'player';

// Player information
export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  isConnected: boolean;
}

// Available player colors
export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export const PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];

// Game session state
export type GamePhase = 'lobby' | 'playing' | 'finished';

export interface GameSession {
  hostConnected: boolean;
  players: Player[];
  phase: GamePhase;
  minPlayers: number;
  maxPlayers: number;
}

// Socket events from client to server
export interface ClientToServerEvents {
  'join-as-host': () => void;
  'join-as-player': (data: { name: string }) => void;
  'start-game': () => void;
  'player-action': (data: { action: unknown }) => void;
  'leave-session': () => void;
}

// Socket events from server to client
export interface ServerToClientEvents {
  'session-state': (session: GameSession) => void;
  'join-error': (error: { message: string }) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'host-connected': () => void;
  'host-disconnected': () => void;
  'game-started': () => void;
  'game-action': (data: { playerId: string; action: unknown }) => void;
}

// Initial session state
export const createInitialSession = (): GameSession => ({
  hostConnected: false,
  players: [],
  phase: 'lobby',
  minPlayers: 2,
  maxPlayers: 5,
});

