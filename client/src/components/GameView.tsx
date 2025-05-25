import React, { useState, useContext, useEffect } from 'react';
import { SocketContext } from '../contexts/SocketContext';
import { GameState, Player, Card as CardType, GameMove, Building as BuildingType } from '../types';
import PlayerHand from './PlayerHand';
import Building from './Building';
import Card from './Card';

interface GameViewProps {
  gameState: GameState;
  currentPlayer: Player;
}

const GameView: React.FC<GameViewProps> = ({ gameState, currentPlayer }) => {
  const { socket } = useContext(SocketContext);
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
  const [targetPlayer, setTargetPlayer] = useState<string | null>(null);
  const [targetBuilding, setTargetBuilding] = useState<number | null>(null);
  const [moveType, setMoveType] = useState<'build' | 'reinforce' | 'attack' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMyTurn = gameState.turnOrder[gameState.currentPlayerIndex] === currentPlayer.id;
  const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];

  useEffect(() => {
    // Reset selections when turn changes
    if (!isMyTurn) {
      setSelectedCards([]);
      setSelectedBuilding(null);
      setTargetPlayer(null);
      setTargetBuilding(null);
      setMoveType(null);
    }
  }, [isMyTurn, gameState.currentPlayerIndex]);

  const handleCardSelect = (card: CardType) => {
    setSelectedCards(prev => [...prev, card]);
    setError(null);
  };

  const handleCardDeselect = (card: CardType) => {
    setSelectedCards(prev => prev.filter(c => c.id !== card.id));
  };

  const handleBuildingSelect = (buildingId: number, playerId?: string) => {
    if (moveType === 'attack' && playerId && playerId !== currentPlayer.id) {
      setTargetPlayer(playerId);
      setTargetBuilding(buildingId);
    } else if ((moveType === 'build' || moveType === 'reinforce') && (!playerId || playerId === currentPlayer.id)) {
      setSelectedBuilding(buildingId);
    }
    setError(null);
  };

  const handleMoveTypeSelect = (type: 'build' | 'reinforce' | 'attack') => {
    setMoveType(type);
    setSelectedCards([]);
    setSelectedBuilding(null);
    setTargetPlayer(null);
    setTargetBuilding(null);
    setError(null);
  };

  const canMakeMove = (): boolean => {
    if (!isMyTurn || !moveType || selectedCards.length === 0) return false;

    switch (moveType) {
      case 'build':
        return selectedBuilding !== null;
      case 'reinforce':
        return selectedBuilding !== null;
      case 'attack':
        return targetPlayer !== null && targetBuilding !== null && selectedCards.length === 1;
      default:
        return false;
    }
  };

  const makeMove = () => {
    if (!canMakeMove() || !socket) return;

    let move: GameMove;

    switch (moveType) {
      case 'build':
        move = {
          type: 'build',
          buildingId: selectedBuilding!,
          cards: selectedCards
        };
        break;
      case 'reinforce':
        move = {
          type: 'reinforce',
          buildingId: selectedBuilding!,
          cards: selectedCards
        };
        break;
      case 'attack':
        move = {
          type: 'attack',
          targetPlayerId: targetPlayer!,
          targetBuildingId: targetBuilding!,
          card: selectedCards[0]
        };
        break;
      default:
        return;
    }

    socket.emit('make-move', {
      gameId: gameState.id,
      move
    });

    // Reset selections
    setSelectedCards([]);
    setSelectedBuilding(null);
    setTargetPlayer(null);
    setTargetBuilding(null);
    setMoveType(null);
  };

  const endTurn = () => {
    if (!socket || !isMyTurn) return;

    socket.emit('make-move', {
      gameId: gameState.id,
      move: { type: 'end-turn' }
    });
  };

  const getOtherPlayers = (): Player[] => {
    return gameState.players.filter(p => p.id !== currentPlayer.id);
  };

  return (
    <div className="game-view">
      <div className="game-header">
        <div className="game-info">
          <h2>🌊 Tsunami Card Game</h2>
          <div className="game-status">
            <span className="game-id">Game ID: {gameState.id}</span>
            <span className="turn-info">
              {isMyTurn ? "Your Turn" : `${currentTurnPlayer.nickname}'s Turn`}
            </span>
          </div>
        </div>

        <div className="game-stats">
          <div className="deck-info">
            <span>Deck: {gameState.deck.length} cards</span>
            <span>Discard: {gameState.discardPile.length} cards</span>
          </div>
          <div className="tsunami-info">
            <span>Tsunami Numbers: {gameState.tsunamiNumbers.join(', ')}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="game-content">
        <div className="players-area">
          {/* Current Player's Area */}
          <div className="current-player-area">
            <div className="player-info">
              <h3>{currentPlayer.nickname} (You)</h3>
              <div className="player-stats">
                <span>Score: {currentPlayer.score}</span>
                <span>Hand: {currentPlayer.hand.length} cards</span>
                {currentPlayer.attacksThisTurn > 0 && (
                  <span>Attacks: {currentPlayer.attacksThisTurn}</span>
                )}
              </div>
            </div>

            <div className="player-neighborhood">
              <h4>Your Neighborhood</h4>
              <div className="buildings-grid">
                {currentPlayer.neighborhood.map(building => (
                  <Building
                    key={building.id}
                    building={building}
                    isOwn={true}
                    isSelected={selectedBuilding === building.id}
                    onClick={() => handleBuildingSelect(building.id)}
                  />
                ))}
              </div>
            </div>

            <PlayerHand
              cards={currentPlayer.hand}
              selectedCards={selectedCards}
              onCardSelect={handleCardSelect}
              onCardDeselect={handleCardDeselect}
              maxSelection={moveType === 'attack' ? 1 : 5}
            />
          </div>

          {/* Other Players */}
          <div className="other-players-area">
            <h3>Other Players</h3>
            {getOtherPlayers().map(player => (
              <div key={player.id} className="opponent-player">
                <div className="opponent-info">
                  <h4>{player.nickname}</h4>
                  <div className="opponent-stats">
                    <span>Score: {player.score}</span>
                    <span>Hand: {player.hand.length} cards</span>
                    {player.isIdle && <span className="idle-indicator">💤 Idle</span>}
                  </div>
                </div>

                <div className="opponent-neighborhood">
                  <div className="buildings-grid">
                    {player.neighborhood.map(building => (
                      <Building
                        key={building.id}
                        building={building}
                        isOwn={false}
                        isTargetable={moveType === 'attack' && building.cards.length > 0 && !building.isProtected}
                        isSelected={targetPlayer === player.id && targetBuilding === building.id}
                        onClick={() => handleBuildingSelect(building.id, player.id)}
                        playerName={player.nickname}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        {isMyTurn && (
          <div className="game-controls">
            <div className="move-type-selection">
              <h4>Choose Action:</h4>
              <div className="move-buttons">
                <button
                  className={`btn ${moveType === 'build' ? 'btn-active' : 'btn-secondary'}`}
                  onClick={() => handleMoveTypeSelect('build')}
                >
                  Build
                </button>
                <button
                  className={`btn ${moveType === 'reinforce' ? 'btn-active' : 'btn-secondary'}`}
                  onClick={() => handleMoveTypeSelect('reinforce')}
                >
                  Reinforce
                </button>
                <button
                  className={`btn ${moveType === 'attack' ? 'btn-active' : 'btn-secondary'}`}
                  onClick={() => handleMoveTypeSelect('attack')}
                >
                  Attack
                </button>
              </div>
            </div>

            <div className="action-controls">
              <button
                className="btn btn-primary"
                onClick={makeMove}
                disabled={!canMakeMove()}
              >
                Make Move
              </button>
              <button
                className="btn btn-warning"
                onClick={endTurn}
              >
                End Turn
              </button>
            </div>

            {moveType && (
              <div className="move-instructions">
                {moveType === 'build' && (
                  <p>Select cards and an empty building to build.</p>
                )}
                {moveType === 'reinforce' && (
                  <p>Select cards and a building with cards to reinforce.</p>
                )}
                {moveType === 'attack' && (
                  <p>Select one card and target an opponent's unprotected building.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameView; 