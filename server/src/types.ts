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

// Game phase
export type GamePhase = 'lobby' | 'playing' | 'finished';

// Turn state
export interface TurnState {
  currentPlayerIndex: number;
  turnNumber: number;
  roundNumber: number;
}

// Game state (during play)
export interface GameState {
  turn: TurnState;
}

// Game session state
export interface GameSession {
  hostConnected: boolean;
  players: Player[];
  phase: GamePhase;
  minPlayers: number;
  maxPlayers: number;
  gameState: GameState | null;
}

// Action types (placeholder - will be expanded)
export type GameActionType = 'end-turn';

export interface GameAction {
  type: GameActionType;
  payload?: unknown;
}

// Socket events from client to server
export interface ClientToServerEvents {
  'join-as-host': () => void;
  'join-as-player': (data: { name: string }) => void;
  'start-game': () => void;
  'player-action': (data: { action: GameAction }) => void;
  'end-turn': () => void;
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
  'turn-changed': (data: { currentPlayerId: string; turnNumber: number; roundNumber: number }) => void;
  'game-action': (data: { playerId: string; action: GameAction }) => void;
  'action-error': (error: { message: string }) => void;
}

// Initial session state
export const createInitialSession = (): GameSession => ({
  hostConnected: false,
  players: [],
  phase: 'lobby',
  minPlayers: 2,
  maxPlayers: 5,
  gameState: null,
});

// Initial game state
export const createInitialGameState = (): GameState => ({
  turn: {
    currentPlayerIndex: 0,
    turnNumber: 1,
    roundNumber: 1,
  },
});
