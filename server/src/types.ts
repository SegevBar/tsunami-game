import { Socket } from 'socket.io';

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

export interface Player {
  id: string;
  socket: Socket;
  name: string;
  isReady: boolean;
  position: Position;
  userId?: string;
}

export interface PlayerData {
  name?: string;
  userId?: string;
  [key: string]: any;
}

export interface MoveData {
  position: Position;
  [key: string]: any;
}

export interface PlayerInfo {
  id: string;
  name: string;
  isReady: boolean;
  position: Position;
  userId?: string;
}

// Database-related types
export interface DatabaseUser {
  _id: string;
  username: string;
  email?: string;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    totalMoves: number;
    totalPlayTime: number;
  };
  preferences: {
    theme?: string;
    soundEnabled: boolean;
  };
  createdAt: Date;
  lastActive: Date;
}

// Socket event types
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
  'user-authenticated': (data: {
    user: DatabaseUser;
    token?: string;
  }) => void;
  'leaderboard-updated': (data: {
    leaderboard: DatabaseUser[];
  }) => void;
  'game-history': (data: {
    sessions: any[];
  }) => void;
}

export interface ClientToServerEvents {
  'join-game': (playerData: PlayerData) => void;
  'join-as-board': () => void;
  'player-move': (moveData: MoveData) => void;
  'authenticate-user': (data: { username: string; password?: string }) => void;
  'create-user': (data: { username: string; email?: string; password?: string }) => void;
  'get-leaderboard': () => void;
  'get-game-history': (data?: { userId?: string }) => void;
}

export interface InterServerEvents {
  // Add inter-server events if needed
}

export interface SocketData {
  userId?: string;
  username?: string;
} 