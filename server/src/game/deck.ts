import { Card, CardColor, CardValue, CARD_COLORS } from '../types';

let cardIdCounter = 0;

function createCard(color: CardColor, value: CardValue): Card {
  return {
    id: `card-${++cardIdCounter}`,
    color,
    value,
  };
}

/**
 * Creates a deck based on the number of players.
 * Per player:
 * - 2 Foundations (value 0) per color = 8 cards
 * - 1 card for values 1-5 per color = 20 cards
 * - 1 Roof (value 6) per color = 4 cards
 * Total per player: 32 cards
 */
export function createDeck(playerCount: number): Card[] {
  const deck: Card[] = [];

  for (let p = 0; p < playerCount; p++) {
    for (const color of CARD_COLORS) {
      // 2 Foundations per color per player
      deck.push(createCard(color, 0));
      deck.push(createCard(color, 0));

      // 1 card for values 1-5 per color per player
      for (let value = 1; value <= 5; value++) {
        deck.push(createCard(color, value as CardValue));
      }

      // 1 Roof per color per player
      deck.push(createCard(color, 6));
    }
  }

  return deck;
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm
 */
export function shuffleDeck<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Draws cards from the deck
 */
export function drawCards(deck: Card[], count: number): { drawn: Card[]; remaining: Card[] } {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
}

/**
 * Resets the card ID counter (useful for testing)
 */
export function resetCardIdCounter(): void {
  cardIdCounter = 0;
}

