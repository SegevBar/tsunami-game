// Shared types between client and server
export interface Position {
  x: number;
  y: number;
}

export interface GameBoard {
  width: number;
  height: number;
  tiles: (string | null)[][];
}

export interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  discardPile: Card[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  turnOrder: string[]; // player IDs in turn order
  createdBy: string; // player ID who created the game
  createdAt: Date;
  tsunamiNumbers: number[]; // 3 random numbers for tsunami cards
}

export interface PlayerInfo {
  id: string;
  name: string;
  isReady: boolean;
  position: Position;
}

export interface PlayerData {
  name?: string;
  [key: string]: any;
}

export interface MoveData {
  position: Position;
  [key: string]: any;
}

// Card Types
export type CardColor = 'red' | 'blue' | 'green' | 'yellow';
export type CardType = 'foundation' | 'regular' | 'roof' | 'tsunami';

export interface Card {
  id: string;
  type: CardType;
  color?: CardColor; // undefined for tsunami cards
  value: number; // 1-5 for regular, 0 for foundation, 6 for roof, 1-6 for tsunami
}

// Building Types
export interface Building {
  id: number; // 0-5 (6 buildings per player)
  cards: Card[];
  isProtected: boolean; // protected until next turn (foundation) or permanently (roof)
  modifiedThisTurn: boolean;
}

// Player Types
export interface Player {
  id: string;
  socketId: string;
  nickname: string;
  email?: string;
  userId?: string;
  hand: Card[];
  neighborhood: Building[]; // 6 buildings
  score: number;
  isIdle: boolean; // true when player made no moves and deck is empty
  attacksThisTurn: number;
}

// Move Types
export type MoveType = 'build' | 'reinforce' | 'attack' | 'end-turn';

export interface BuildMove {
  type: 'build';
  buildingId: number;
  cards: Card[];
}

export interface ReinforceMove {
  type: 'reinforce';
  buildingId: number;
  cards: Card[];
}

export interface AttackMove {
  type: 'attack';
  targetPlayerId: string;
  targetBuildingId: number;
  card: Card;
}

export interface EndTurnMove {
  type: 'end-turn';
}

export type GameMove = BuildMove | ReinforceMove | AttackMove | EndTurnMove;

// Socket event types for client
export interface ServerToClientEvents {
  // Game management
  'game-created': (data: { gameId: string; maxPlayers: number }) => void;
  'game-joined': (data: { gameId: string; players: Player[]; gameState: GameState }) => void;
  'game-started': (gameState: GameState) => void;
  'game-ended': (data: { winner: Player; finalScores: { player: Player; score: number }[] }) => void;
  'game-aborted': () => void;
  
  // Player management
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'player-connected': (player: Player) => void;
  'player-disconnected': (playerId: string) => void;
  
  // Game actions
  'turn-started': (data: { currentPlayer: Player; gameState: GameState }) => void;
  'move-made': (data: { move: GameMove; gameState: GameState; player: Player }) => void;
  'tsunami-triggered': (data: { tsunamiValue: number; destroyedCards: { playerId: string; buildingId: number; cards: Card[] }[] }) => void;
  'cards-drawn': (data: { playerId: string; cardsCount: number }) => void;
  
  // Errors and validation
  'invalid-move': (error: string) => void;
  'game-error': (error: string) => void;
  
  // Authentication
  'user-authenticated': (data: { user: any; token?: string }) => void;
  'authentication-failed': (error: string) => void;
  'user-created': (data: { user: any; token?: string }) => void;
  'user-creation-failed': (error: string) => void;
  
  // Leaderboard and history
  'leaderboard': (data: any[]) => void;
  'game-history': (data: any[]) => void;
}

export interface ClientToServerEvents {
  // Game management
  'create-game': (data: { maxPlayers: number; nickname: string; email?: string }) => void;
  'join-game': (data: { gameId: string; nickname: string; email?: string }) => void;
  'start-game': (gameId: string) => void;
  'abort-game': (gameId: string) => void;
  'leave-game': (gameId: string) => void;
  
  // Game actions
  'make-move': (data: { gameId: string; move: GameMove }) => void;
  
  // Authentication
  'authenticate-user': (data: { username: string; password?: string }) => void;
  'create-user': (data: { username: string; email?: string; password?: string }) => void;
  
  // Data requests
  'get-leaderboard': () => void;
  'get-game-history': (data?: { userId?: string }) => void;
}

// React component props
export interface GameBoardProps {
  gameState: GameState | null;
  players: PlayerInfo[];
  currentPlayerId: string | null;
  onCellClick: ((position: Position) => void) | null;
  isInteractive: boolean;
}

export interface SocketContextType {
  socket: any; // Socket type from socket.io-client
  connected: boolean;
  gameState: GameState | null;
  players: PlayerInfo[];
  playerId: string | null;
  joinAsPlayer: (playerData: PlayerData) => void;
  joinAsBoard: () => void;
  makeMove: (moveData: MoveData) => void;
}

// UI State Types
export interface UIState {
  currentView: 'home' | 'create-game' | 'join-game' | 'lobby' | 'game' | 'game-over';
  selectedCards: Card[];
  selectedBuilding: number | null;
  targetPlayer: string | null;
  targetBuilding: number | null;
  showRules: boolean;
  showAbout: boolean;
}

// Game Creation Data
export interface CreateGameData {
  maxPlayers: number;
  nickname: string;
  email?: string;
}

export interface JoinGameData {
  gameId: string;
  nickname: string;
  email?: string;
} 