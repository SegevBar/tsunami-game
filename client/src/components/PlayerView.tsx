import React, { useState, useEffect, FormEvent } from 'react';
import { useSocket } from '../contexts/SocketContext';
import GameBoard from './GameBoard';
import { Position, PlayerInfo } from '../types';

const PlayerView: React.FC = () => {
  const { connected, gameState, players, playerId, joinAsPlayer, makeMove } = useSocket();
  const [playerName, setPlayerName] = useState<string>('');
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  useEffect(() => {
    if (playerId) {
      setHasJoined(true);
    }
  }, [playerId]);

  const handleJoinGame = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (playerName.trim()) {
      joinAsPlayer({ name: playerName.trim() });
    }
  };

  const handleMove = (position: Position): void => {
    makeMove({ position });
  };

  const currentPlayer: PlayerInfo | undefined = players.find(p => p.id === playerId);

  if (!connected) {
    return (
      <div className="player-view">
        <div className="connection-error">
          🔴 Not connected to server. Please check your connection.
        </div>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <div className="player-view">
        <div className="join-form">
          <h2>🎮 Join the Game</h2>
          <form onSubmit={handleJoinGame}>
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              required
            />
            <button type="submit" disabled={!playerName.trim()}>
              Join Game
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="player-view">
      <div className="player-header">
        <h2>🎮 Player: {currentPlayer?.name}</h2>
        <div className="player-info">
          <span>Position: ({currentPlayer?.position.x}, {currentPlayer?.position.y})</span>
          <span>Players Online: {players.length}</span>
          <span>Game Status: {gameState?.isActive ? '🟢 Active' : '🟡 Waiting'}</span>
        </div>
      </div>

      <div className="game-container">
        <GameBoard 
          gameState={gameState}
          players={players}
          currentPlayerId={playerId}
          onCellClick={handleMove}
          isInteractive={true}
        />
      </div>

      <div className="controls">
        <h3>Controls</h3>
        <p>Click on the board to move your player</p>
        <div className="movement-buttons">
          <button onClick={() => handleMove({ x: Math.max(0, (currentPlayer?.position.x || 0) - 1), y: currentPlayer?.position.y || 0 })}>
            ⬅️ Left
          </button>
          <button onClick={() => handleMove({ x: currentPlayer?.position.x || 0, y: Math.max(0, (currentPlayer?.position.y || 0) - 1) })}>
            ⬆️ Up
          </button>
          <button onClick={() => handleMove({ x: currentPlayer?.position.x || 0, y: Math.min(9, (currentPlayer?.position.y || 0) + 1) })}>
            ⬇️ Down
          </button>
          <button onClick={() => handleMove({ x: Math.min(9, (currentPlayer?.position.x || 0) + 1), y: currentPlayer?.position.y || 0 })}>
            ➡️ Right
          </button>
        </div>
      </div>

      <div className="players-list">
        <h3>Players ({players.length})</h3>
        <ul>
          {players.map(player => (
            <li key={player.id} className={player.id === playerId ? 'current-player' : ''}>
              {player.name} {player.id === playerId && '(You)'}
              <span className="position">({player.position.x}, {player.position.y})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlayerView; 