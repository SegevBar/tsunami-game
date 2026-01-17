// ===================
// Card Types
// ===================

export type CardColor = 'red' | 'blue' | 'green' | 'yellow';

export const CARD_COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];

// Card values: 0 = Foundation, 1-5 = regular, 6 = Roof
export type CardValue = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Tsunami card values: 0-5
export type TsunamiValue = 0 | 1 | 2 | 3 | 4 | 5;

// Discriminated union for all card types
export type DeckCard =
  | { id: string; type: 'regular'; color: CardColor; value: CardValue }
  | { id: string; type: 'tsunami'; value: TsunamiValue };

// Type alias for regular cards (for hands, which only contain regular cards)
export type RegularCard = Extract<DeckCard, { type: 'regular' }>;

// Type guard for tsunami cards
export function isTsunamiCard(card: DeckCard): card is Extract<DeckCard, { type: 'tsunami' }> {
  return card.type === 'tsunami';
}

// Type guard for regular cards
export function isRegularCard(card: DeckCard): card is RegularCard {
  return card.type === 'regular';
}

// Card name helpers
export function getCardName(card: DeckCard): string {
  if (isTsunamiCard(card)) {
    return `Tsunami ${card.value}`;
  }
  if (card.value === 0) return 'Foundation';
  if (card.value === 6) return 'Roof';
  return card.value.toString();
}

// Player's hand (only visible to the player) - only regular cards
export interface PlayerHand {
  playerId: string;
  cards: RegularCard[];
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

// Full game state (server-side, contains all info)
export interface GameState {
  turn: TurnState;
  deck: DeckCard[];
  hands: PlayerHand[];
  tsunamiPositions: number[]; // Positions of tsunami cards in the deck (for tracking)
}

// Public game state (sent to clients, hides other players' cards)
export interface PublicGameState {
  turn: TurnState;
  deckCount: number;
  hands: PublicHandInfo[];
  cardsUntilNextTsunami: number | null; // null if no more tsunamis in deck
}

// ===================
// Actions
// ===================

export type GameActionType = 'end-turn';

export interface GameAction {
  type: GameActionType;
  payload?: unknown;
}

