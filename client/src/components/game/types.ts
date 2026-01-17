// ===================
// Card Types
// ===================

export type CardColor = 'red' | 'blue' | 'green' | 'yellow';

export const CARD_COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];

// Card values: 0 = Foundation, 1-5 = regular, 6 = Roof
export type CardValue = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
}

// Card name helpers
export function getCardName(value: CardValue): string {
  if (value === 0) return 'Foundation';
  if (value === 6) return 'Roof';
  return value.toString();
}

// Player's hand (only visible to the player)
export interface PlayerHand {
  playerId: string;
  cards: Card[];
}

// Public hand info (visible to everyone - just card count)
export interface PublicHandInfo {
  playerId: string;
  cardCount: number;
}

// ===================
// Turn State
// ===================

export interface TurnState {
  currentPlayerIndex: number;
  turnNumber: number;
  roundNumber: number;
}

// ===================
// Game State
// ===================

// Public game state (what clients receive)
export interface PublicGameState {
  turn: TurnState;
  deckCount: number;
  hands: PublicHandInfo[];
}

// ===================
// Actions
// ===================

export type GameActionType = 'end-turn';

export interface GameAction {
  type: GameActionType;
  payload?: unknown;
}

