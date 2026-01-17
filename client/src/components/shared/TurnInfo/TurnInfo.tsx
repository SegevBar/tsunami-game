import { TurnState } from '../../../types';
import './TurnInfo.scss';

interface TurnInfoProps {
  turn: TurnState;
  variant?: 'badges' | 'inline';
}

export function TurnInfo({ turn, variant = 'badges' }: TurnInfoProps) {
  if (variant === 'inline') {
    return (
      <div className="turn-info-inline">
        <span>Round {turn.roundNumber}</span>
        <span>•</span>
        <span>Turn {turn.turnNumber}</span>
      </div>
    );
  }

  return (
    <div className="turn-info-badges">
      <div className="round-badge">Round {turn.roundNumber}</div>
      <div className="turn-badge">Turn {turn.turnNumber}</div>
    </div>
  );
}

