import { CardColor, CardValue, CARD_COLORS, TsunamiValue, DeckCard, RegularCard } from './types';

let cardIdCounter = 0;

type TsunamiCard = Extract<DeckCard, { type: 'tsunami' }>;

function createCard(color: CardColor, value: CardValue): RegularCard {
  return {
    id: `card-${++cardIdCounter}`,
    type: 'regular',
    color,
    value,
  };
}

function createTsunamiCard(value: TsunamiValue): TsunamiCard {
  return {
    id: `tsunami-${++cardIdCounter}`,
    type: 'tsunami',
    value,
  };
}

/**
 * Creates the set of all possible tsunami cards (values 0-5)
 */
export function createTsunamiCards(): TsunamiCard[] {
  const tsunamiValues: TsunamiValue[] = [0, 1, 2, 3, 4, 5];
  return tsunamiValues.map((value) => createTsunamiCard(value));
}

/**
 * Selects 3 random tsunami cards from the available set
 */
export function selectRandomTsunamiCards(count: number = 3): TsunamiCard[] {
  const allTsunamis = createTsunamiCards();
  const shuffled = shuffleDeck(allTsunamis);
  return shuffled.slice(0, count);
}

/**
 * Creates a deck based on the number of players.
 * Per player:
 * - 2 Foundations (value 0) per color = 8 cards
 * - 1 card for values 1-5 per color = 20 cards
 * - 1 Roof (value 6) per color = 4 cards
 * Total per player: 32 cards
 */
export function createDeck(playerCount: number): RegularCard[] {
  const deck: RegularCard[] = [];

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
 * Inserts tsunami cards into the deck:
 * - 1 at the bottom (last card)
 * - 2 randomly after the first quarter of the deck
 * 
 * Returns the deck with tsunamis and their positions
 */
export function insertTsunamiCards(
  deck: DeckCard[],
  tsunamis: TsunamiCard[]
): { deck: DeckCard[]; positions: number[]; log: string[] } {
  const log: string[] = [];
  const positions: number[] = [];
  const result = [...deck];

  // First, insert the bottom tsunami (will be at the end)
  const bottomTsunami = tsunamis[0];
  result.push(bottomTsunami);
  const bottomPosition = result.length - 1;
  positions.push(bottomPosition);
  log.push(`Tsunami ${bottomTsunami.value} inserted at position ${bottomPosition} (bottom of deck)`);

  // Calculate the first quarter boundary
  const firstQuarterEnd = Math.floor(deck.length / 4);

  // Insert the other 2 tsunamis randomly after the first quarter
  // We need to insert them in positions between firstQuarterEnd and the end (before bottom tsunami)
  const availableRange = result.length - 1 - firstQuarterEnd; // -1 because bottom tsunami is already placed

  // Generate 2 random positions after the first quarter
  const randomPositions: number[] = [];
  for (let i = 0; i < 2; i++) {
    // Random position from firstQuarterEnd to (length - 1 - already inserted tsunamis)
    const maxPos = result.length - 1 - i; // Account for already inserted cards
    const minPos = firstQuarterEnd;
    const pos = minPos + Math.floor(Math.random() * (maxPos - minPos));
    randomPositions.push(pos);
  }

  // Sort positions in descending order to insert from back to front (to maintain correct indices)
  randomPositions.sort((a, b) => b - a);

  // Insert the remaining tsunamis
  for (let i = 0; i < 2; i++) {
    const tsunami = tsunamis[i + 1];
    const pos = randomPositions[i];
    result.splice(pos, 0, tsunami);
    log.push(`Tsunami ${tsunami.value} inserted at position ${pos} (after first quarter)`);
  }

  // Recalculate actual positions of all tsunamis in the final deck
  const finalPositions: number[] = [];
  result.forEach((card, index) => {
    if (card.type === 'tsunami') {
      finalPositions.push(index);
    }
  });

  log.push(`Final tsunami positions in deck: ${finalPositions.join(', ')}`);
  log.push(`Deck size: ${result.length}, First quarter ends at: ${firstQuarterEnd}`);

  return { deck: result, positions: finalPositions, log };
}

/**
 * Finds the position of the next tsunami card in the deck
 * Returns null if no tsunami cards remain
 */
export function findNextTsunamiPosition(deck: DeckCard[]): number | null {
  for (let i = 0; i < deck.length; i++) {
    if (deck[i].type === 'tsunami') {
      return i;
    }
  }
  return null;
}

/**
 * Draws cards from the deck (only regular cards go to hand)
 */
export function drawCards(deck: DeckCard[], count: number): { drawn: RegularCard[]; remaining: DeckCard[] } {
  const drawn: RegularCard[] = [];
  let remaining = [...deck];

  while (drawn.length < count && remaining.length > 0) {
    const card = remaining.shift()!;
    if (card.type === 'regular') {
      drawn.push(card);
    }
    // Note: In actual gameplay, tsunami cards would trigger effects
    // For initial dealing, we skip them (they shouldn't be at the top anyway)
  }

  return { drawn, remaining };
}

/**
 * Resets the card ID counter (useful for testing)
 */
export function resetCardIdCounter(): void {
  cardIdCounter = 0;
}
