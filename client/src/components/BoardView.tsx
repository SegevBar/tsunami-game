import React, { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import GameBoard from './GameBoard';

const BoardView: React.FC = () => {
  const { connected, gameState, players, joinAsBoard } = useSocket();

  useEffect(() => {
    if (connected) {
      joinAsBoard();
    }
  }, [connected, joinAsBoard]);

  if (!connected) {
    return (
      <div className="board-view">
        <div className="connection-error">
          🔴 Not connected to server. Please check your connection.
        </div>
      </div>
    );
  }

  return (
    <div className="board-view">
      <div className="board-header">
        <h1>📺 Game Board</h1>
        <div className="game-info">
          <span>Players Online: {players.length}</span>
          <span>Game Status: {gameState?.isActive ? '🟢 Active' : '🟡 Waiting'}</span>
          <span>Turn: {gameState?.turn || 0}</span>
        </div>
      </div>

      <div className="game-container">
        <GameBoard 
          gameState={gameState}
          players={players}
          currentPlayerId={null}
          onCellClick={null}
          isInteractive={false}
        />
      </div>

      <div className="players-panel">
        <h3>Active Players ({players.length})</h3>
        <div className="players-grid">
          {players.map(player => (
            <div key={player.id} className="player-card">
              <div className="player-name">{player.name}</div>
              <div className="player-position">
                Position: ({player.position.x}, {player.position.y})
              </div>
              <div className="player-status">
                {player.isReady ? '✅ Ready' : '⏳ Not Ready'}
              </div>
            </div>
          ))}
        </div>
        
        {players.length === 0 && (
          <div className="no-players">
            No players connected. Waiting for players to join...
          </div>
        )}
      </div>

      <div className="game-stats">
        <h3>Game Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Moves:</span>
            <span className="stat-value">{gameState?.turn || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Board Size:</span>
            <span className="stat-value">
              {gameState?.board?.width || 0} × {gameState?.board?.height || 0}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Game Mode:</span>
            <span className="stat-value">Multiplayer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardView; 