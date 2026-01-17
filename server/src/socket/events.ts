import { Player, GamePhase } from '../session/types';
import { GameAction, PlayerHand, PublicGameState } from '../game/types';

// ===================
// Game Session (for socket events)
// ===================

export interface GameSession {
  hostConnected: boolean;
  players: Player[];
  phase: GamePhase;
  minPlayers: number;
  maxPlayers: number;
  gameState: PublicGameState | null;
}

// ===================
// Socket Events
// ===================

export interface ClientToServerEvents {
  'join-as-host': () => void;
  'join-as-player': (data: { name: string }) => void;
  'start-game': () => void;
  'player-action': (data: { action: GameAction }) => void;
  'end-turn': () => void;
  'leave-session': () => void;
}

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
  'hand-updated': (hand: PlayerHand) => void;
}
