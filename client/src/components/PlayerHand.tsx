import React from 'react';
import { Card as CardType } from '../types';
import Card from './Card';

interface PlayerHandProps {
  cards: CardType[];
  selectedCards: CardType[];
  onCardSelect: (card: CardType) => void;
  onCardDeselect: (card: CardType) => void;
  playableCards?: CardType[];
  maxSelection?: number;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  selectedCards,
  onCardSelect,
  onCardDeselect,
  playableCards = [],
  maxSelection = 5
}) => {
  const isCardSelected = (card: CardType): boolean => {
    return selectedCards.some(selected => selected.id === card.id);
  };

  const isCardPlayable = (card: CardType): boolean => {
    return playableCards.some(playable => playable.id === card.id);
  };

  const handleCardClick = (card: CardType) => {
    if (isCardSelected(card)) {
      onCardDeselect(card);
    } else if (selectedCards.length < maxSelection) {
      onCardSelect(card);
    }
  };

  const getCardsByType = () => {
    const grouped = {
      foundation: cards.filter(card => card.type === 'foundation'),
      regular: cards.filter(card => card.type === 'regular'),
      roof: cards.filter(card => card.type === 'roof'),
      tsunami: cards.filter(card => card.type === 'tsunami')
    };
    return grouped;
  };

  const sortCardsByValue = (cards: CardType[]): CardType[] => {
    return [...cards].sort((a, b) => {
      // First sort by color, then by value
      if (a.color && b.color && a.color !== b.color) {
        return a.color.localeCompare(b.color);
      }
      return a.value - b.value;
    });
  };

  return (
    <div className="player-hand">
      <div className="hand-header">
        <h3>Your Hand ({cards.length} cards)</h3>
        {selectedCards.length > 0 && (
          <div className="selection-info">
            Selected: {selectedCards.length}/{maxSelection}
          </div>
        )}
      </div>

      <div className="hand-content">
        <div className="hand-cards">
          {sortCardsByValue(cards).map(card => (
            <Card
              key={card.id}
              card={card}
              isSelected={isCardSelected(card)}
              isPlayable={isCardPlayable(card)}
              onClick={() => handleCardClick(card)}
              size="medium"
            />
          ))}
        </div>

        {cards.length === 0 && (
          <div className="empty-hand">
            <div className="empty-hand-icon">🃏</div>
            <div className="empty-hand-text">No cards in hand</div>
          </div>
        )}
      </div>

      <div className="hand-footer">
        <div className="hand-summary">
          <div className="card-type-counts">
            {Object.entries(getCardsByType()).map(([type, typeCards]) => (
              typeCards.length > 0 && (
                <span key={type} className={`type-count type-${type}`}>
                  {type}: {typeCards.length}
                </span>
              )
            ))}
          </div>
        </div>

        {selectedCards.length > 0 && (
          <div className="selected-cards-preview">
            <h4>Selected Cards:</h4>
            <div className="selected-cards-list">
              {selectedCards.map(card => (
                <span key={card.id} className="selected-card-info">
                  {card.type} {card.value} {card.color && `(${card.color})`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerHand; 