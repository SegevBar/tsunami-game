import React from 'react';
import { Building as BuildingType } from '../types';
import Card from './Card';

interface BuildingProps {
  building: BuildingType;
  isOwn?: boolean;
  isTargetable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  playerName?: string;
}

const Building: React.FC<BuildingProps> = ({
  building,
  isOwn = false,
  isTargetable = false,
  isSelected = false,
  onClick,
  playerName
}) => {
  const buildingClasses = [
    'building',
    isOwn ? 'building-own' : 'building-opponent',
    isTargetable ? 'building-targetable' : '',
    isSelected ? 'building-selected' : '',
    building.isProtected ? 'building-protected' : '',
    building.modifiedThisTurn ? 'building-modified' : '',
    building.cards.length === 0 ? 'building-empty' : ''
  ].filter(Boolean).join(' ');

  const getBuildingHeight = (): number => {
    return building.cards.length;
  };

  const getBuildingValue = (): number => {
    return building.cards.reduce((sum, card) => sum + card.value, 0);
  };

  const getTopCard = () => {
    return building.cards.length > 0 ? building.cards[building.cards.length - 1] : null;
  };

  const hasFoundation = (): boolean => {
    return building.cards.some(card => card.type === 'foundation');
  };

  const hasRoof = (): boolean => {
    return building.cards.some(card => card.type === 'roof');
  };

  return (
    <div className={buildingClasses} onClick={onClick}>
      <div className="building-header">
        <div className="building-info">
          <span className="building-id">Building {building.id + 1}</span>
          {playerName && <span className="building-owner">{playerName}</span>}
        </div>
        <div className="building-stats">
          <span className="building-height">Height: {getBuildingHeight()}</span>
          <span className="building-value">Value: {getBuildingValue()}</span>
        </div>
      </div>

      <div className="building-content">
        {building.cards.length === 0 ? (
          <div className="building-empty-slot">
            <div className="empty-slot-icon">🏗️</div>
            <div className="empty-slot-text">Empty Lot</div>
          </div>
        ) : (
          <div className="building-cards">
            {building.cards.map((card, index) => (
              <div 
                key={card.id} 
                className="building-card-slot"
                style={{ zIndex: index }}
              >
                <Card 
                  card={card} 
                  size="small"
                  isPlayable={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="building-footer">
        <div className="building-status">
          {building.isProtected && (
            <span className="protection-indicator">
              🛡️ Protected
            </span>
          )}
          {building.modifiedThisTurn && (
            <span className="modified-indicator">
              ✨ Modified
            </span>
          )}
          {hasFoundation() && (
            <span className="foundation-indicator">
              🏗️ Foundation
            </span>
          )}
          {hasRoof() && (
            <span className="roof-indicator">
              🏛️ Roof
            </span>
          )}
        </div>
        
        {getTopCard() && (
          <div className="top-card-info">
            Top: {getTopCard()?.type} ({getTopCard()?.value})
          </div>
        )}
      </div>
    </div>
  );
};

export default Building; 