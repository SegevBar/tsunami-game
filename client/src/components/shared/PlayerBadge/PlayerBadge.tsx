import { Player } from '../../../types';
import './PlayerBadge.scss';

interface PlayerBadgeProps {
  player: Player | undefined;
  name: string;
}

export function PlayerBadge({ player, name }: PlayerBadgeProps) {
  return (
    <div className={`player-badge ${player?.color || ''}`}>
      <div className="badge-avatar">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="badge-info">
        <span className="badge-name">{name}</span>
        <span className="badge-color">{player?.color}</span>
      </div>
    </div>
  );
}

