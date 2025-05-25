import React from 'react';
import { GameBoardProps, PlayerInfo, Position } from '../types';

const GameBoard: React.FC<GameBoardProps> = ({ 
  gameState, 
  players, 
  currentPlayerId, 
  onCellClick, 
  isInteractive 
}) => {
  if (!gameState?.board) {
    return (
      <div className="game-board-loading">
        <div className="loading-message">Loading game board...</div>
      </div>
    );
  }

  const { width, height, tiles } = gameState.board;

  const getPlayerAtPosition = (x: number, y: number): PlayerInfo | undefined => {
    return players.find(player => player.position.x === x && player.position.y === y);
  };

  const getPlayerColor = (playerId: string): string => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const playerIndex = players.findIndex(p => p.id === playerId);
    return colors[playerIndex % colors.length] || '#ccc';
  };

  const handleCellClick = (x: number, y: number): void => {
    if (isInteractive && onCellClick) {
      onCellClick({ x, y });
    }
  };

  const renderCell = (x: number, y: number): JSX.Element => {
    const player = getPlayerAtPosition(x, y);
    const isCurrentPlayer = player?.id === currentPlayerId;
    const tileValue = tiles[y]?.[x];

    return (
      <div
        key={`${x}-${y}`}
        className={`game-cell ${isInteractive ? 'interactive' : ''} ${isCurrentPlayer ? 'current-player' : ''}`}
        onClick={() => handleCellClick(x, y)}
        style={{
          backgroundColor: player ? getPlayerColor(player.id) : tileValue ? '#e0e0e0' : '#f5f5f5',
          border: isCurrentPlayer ? '3px solid #FFD700' : '1px solid #ddd'
        }}
      >
        {player && (
          <div className="player-marker">
            <div className="player-icon">🎮</div>
            <div className="player-name">{player.name}</div>
          </div>
        )}
        <div className="cell-coordinates">{x},{y}</div>
      </div>
    );
  };

  return (
    <div className="game-board">
      <div 
        className="board-grid"
        style={{
          gridTemplateColumns: `repeat(${width}, 1fr)`,
          gridTemplateRows: `repeat(${height}, 1fr)`
        }}
      >
        {Array.from({ length: height }, (_, y) =>
          Array.from({ length: width }, (_, x) => renderCell(x, y))
        )}
      </div>
      
      <div className="board-legend">
        <h4>Players on Board:</h4>
        <div className="legend-items">
          {players.map(player => (
            <div key={player.id} className="legend-item">
              <div 
                className="legend-color"
                style={{ backgroundColor: getPlayerColor(player.id) }}
              ></div>
              <span>{player.name}</span>
              {player.id === currentPlayerId && <span className="you-indicator">(You)</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard; 