import { Card } from '../../../../types';
import { CardComponent } from '../CardComponent';
import './HandDisplay.scss';

interface HandDisplayProps {
  cards: Card[];
  onCardClick?: (card: Card) => void;
  selectedCardId?: string | null;
}

export function HandDisplay({ cards, onCardClick, selectedCardId }: HandDisplayProps) {
  // Sort cards by color, then by value
  const sortedCards = [...cards].sort((a, b) => {
    if (a.color !== b.color) {
      return a.color.localeCompare(b.color);
    }
    return a.value - b.value;
  });

  return (
    <div className="hand-display">
      <div className="cards-container">
        {sortedCards.map((card) => (
          <CardComponent
            key={card.id}
            card={card}
            onClick={onCardClick ? () => onCardClick(card) : undefined}
            selected={selectedCardId === card.id}
          />
        ))}
      </div>
      <div className="hand-count">{cards.length} cards</div>
    </div>
  );
}

