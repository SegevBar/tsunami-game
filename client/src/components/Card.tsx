import React from 'react';
import { Card as CardType, CardColor, CardType as CardTypeEnum } from '../types';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  isPlayable?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  showBack?: boolean;
}

const Card: React.FC<CardProps> = ({
  card,
  isSelected = false,
  isPlayable = false,
  onClick,
  size = 'medium',
  showBack = false
}) => {
  const getCardColorClass = (color?: CardColor): string => {
    if (!color) return 'card-tsunami';
    return `card-${color}`;
  };

  const getCardTypeIcon = (type: CardTypeEnum): string => {
    switch (type) {
      case 'foundation':
        return '🏗️';
      case 'regular':
        return '🏠';
      case 'roof':
        return '🏛️';
      case 'tsunami':
        return '🌊';
      default:
        return '❓';
    }
  };

  const getCardValue = (): string => {
    if (card.type === 'foundation') return 'F';
    if (card.type === 'roof') return 'R';
    if (card.type === 'tsunami') return `T${card.value}`;
    return card.value.toString();
  };

  const cardClasses = [
    'game-card',
    `card-${size}`,
    getCardColorClass(card.color),
    isSelected ? 'card-selected' : '',
    isPlayable ? 'card-playable' : '',
    showBack ? 'card-back' : ''
  ].filter(Boolean).join(' ');

  if (showBack) {
    return (
      <div className={cardClasses} onClick={onClick}>
        <div className="card-back-content">
          <div className="card-back-pattern">🌊</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="card-content">
        <div className="card-header">
          <span className="card-value">{getCardValue()}</span>
          <span className="card-icon">{getCardTypeIcon(card.type)}</span>
        </div>
        
        <div className="card-center">
          <div className="card-type-display">
            {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
          </div>
          {card.color && (
            <div className={`card-color-indicator ${getCardColorClass(card.color)}`}>
              ●
            </div>
          )}
        </div>

        <div className="card-footer">
          <span className="card-value-bottom">{getCardValue()}</span>
        </div>
      </div>
    </div>
  );
};

export default Card; 