import { Card, getCardName } from '../../../../types';
import './CardComponent.scss';

interface CardComponentProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
}

export function CardComponent({ card, onClick, selected }: CardComponentProps) {
  const cardName = getCardName(card.value);
  const isSpecial = card.value === 0 || card.value === 6;

  return (
    <div
      className={`card ${card.color} ${selected ? 'selected' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="card-value">
        {isSpecial ? cardName.charAt(0) : card.value}
      </div>
      <div className="card-name">{cardName}</div>
    </div>
  );
}

