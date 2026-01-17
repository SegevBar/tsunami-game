import { GameSession, Player } from '../../types';
import { PlayerBadge } from '../PlayerBadge';
import './PlayerLobby.scss';

interface PlayerLobbyProps {
  session: GameSession;
  currentPlayer: Player | undefined;
  playerName: string;
}

export function PlayerLobby({ session, currentPlayer, playerName }: PlayerLobbyProps) {
  return (
    <div className="player-lobby">
      <PlayerBadge player={currentPlayer} name={playerName} />

      <h2>Waiting for Host to Start</h2>

      <div className="lobby-info">
        <div className="info-item">
          <span className="label">Players</span>
          <span className="value">{session.players.length} / {session.maxPlayers}</span>
        </div>
        <div className="info-item">
          <span className="label">Host</span>
          <span className={`value ${session.hostConnected ? 'online' : 'offline'}`}>
            {session.hostConnected ? 'Connected' : 'Waiting...'}
          </span>
        </div>
      </div>

      <div className="other-players">
        <h4>Other Players</h4>
        <div className="player-list">
          {session.players
            .filter((p) => p.name !== playerName)
            .map((player) => (
              <div key={player.id} className={`player-chip ${player.color}`}>
                {player.name}
              </div>
            ))}
          {session.players.length === 1 && (
            <span className="no-others">No other players yet</span>
          )}
        </div>
      </div>
    </div>
  );
}

