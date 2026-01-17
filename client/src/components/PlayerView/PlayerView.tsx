import { GameSession } from '../../types';
import './PlayerView.scss';

interface PlayerViewProps {
  session: GameSession;
  playerName: string;
}

export function PlayerView({ session, playerName }: PlayerViewProps) {
  const currentPlayer = session.players.find((p) => p.name === playerName);

  return (
    <div className="player-view">
      {session.phase === 'lobby' ? (
        <div className="waiting-room">
          <div className={`player-badge ${currentPlayer?.color || ''}`}>
            <div className="badge-avatar">
              {playerName.charAt(0).toUpperCase()}
            </div>
            <div className="badge-info">
              <span className="badge-name">{playerName}</span>
              <span className="badge-color">{currentPlayer?.color}</span>
            </div>
          </div>

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
      ) : session.phase === 'playing' ? (
        <div className="game-controls">
          <div className={`player-badge small ${currentPlayer?.color || ''}`}>
            <span>{playerName}</span>
          </div>

          <h2>Your Turn</h2>

          <div className="controls-placeholder">
            <p>🎮 Player controls will appear here</p>
            <p className="hint">This is where you'll make your moves</p>
          </div>
        </div>
      ) : (
        <div className="game-over">
          <h2>Game Over</h2>
          <p>Check the host screen for results</p>
        </div>
      )}
    </div>
  );
}

