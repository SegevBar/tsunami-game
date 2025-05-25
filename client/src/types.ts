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
  isActive: boolean;
  currentPlayer: string | null;
  board: GameBoard;
  turn: number;
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

// Socket event types for client
export interface ServerToClientEvents {
  'player-joined': (data: {
    playerId: string;
    gameState: GameState;
    players: PlayerInfo[];
  }) => void;
  'board-connected': (data: {
    gameState: GameState;
    players: PlayerInfo[];
  }) => void;
  'player-connected': (data: {
    player: PlayerInfo;
  }) => void;
  'player-disconnected': (data: {
    playerId: string;
  }) => void;
  'player-moved': (data: {
    playerId: string;
    moveData: MoveData;
    gameState: GameState;
  }) => void;
  'game-started': (data: {
    gameState: GameState;
  }) => void;
  'game-reset': (data: {
    gameState: GameState;
  }) => void;
  'invalid-move': (data: {
    reason: string;
  }) => void;
}

export interface ClientToServerEvents {
  'join-game': (playerData: PlayerData) => void;
  'join-as-board': () => void;
  'player-move': (moveData: MoveData) => void;
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