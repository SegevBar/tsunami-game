import { GameSession } from '../../types';
import { socket } from '../../socket';
import './HostView.scss';

interface HostViewProps {
  session: GameSession;
}

export function HostView({ session }: HostViewProps) {
  const canStartGame = session.players.length >= session.minPlayers && session.phase === 'lobby';

  const handleStartGame = () => {
    socket.emit('start-game');
  };

  return (
    <div className="host-view">
      {session.phase === 'lobby' ? (
        <div className="lobby">
          <h2>Waiting for Players</h2>
          <p className="player-count">
            {session.players.length} / {session.maxPlayers} players
            {session.players.length < session.minPlayers && (
              <span className="min-notice"> (need at least {session.minPlayers})</span>
            )}
          </p>

          <div className="players-grid">
            {session.players.map((player) => (
              <div key={player.id} className={`player-card ${player.color}`}>
                <div className="player-avatar">{player.name.charAt(0).toUpperCase()}</div>
                <div className="player-name">{player.name}</div>
                <div className={`player-status ${player.isConnected ? 'online' : 'offline'}`}>
                  {player.isConnected ? 'Ready' : 'Disconnected'}
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: session.maxPlayers - session.players.length }).map((_, i) => (
              <div key={`empty-${i}`} className="player-card empty">
                <div className="player-avatar">?</div>
                <div className="player-name">Waiting...</div>
              </div>
            ))}
          </div>

          <button
            className="start-btn"
            onClick={handleStartGame}
            disabled={!canStartGame}
          >
            {canStartGame ? 'Start Game' : `Need ${session.minPlayers - session.players.length} more player(s)`}
          </button>
        </div>
      ) : session.phase === 'playing' ? (
        <div className="game-board">
          <h2>Game in Progress</h2>
          <div className="board-placeholder">
            <p>🎮 Game board will be displayed here</p>
            <div className="active-players">
              {session.players.map((player) => (
                <div key={player.id} className={`player-indicator ${player.color}`}>
                  {player.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="game-finished">
          <h2>Game Finished</h2>
          <p>Results will be shown here</p>
        </div>
      )}
    </div>
  );
}

