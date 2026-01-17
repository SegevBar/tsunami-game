import { GameSession, Player } from '../../types';
import { socket } from '../../socket';
import { PlayerBadge } from '../PlayerBadge';
import { TurnInfo } from '../TurnInfo';
import './PlayerGameControls.scss';

interface PlayerGameControlsProps {
  session: GameSession;
  currentPlayer: Player | undefined;
  playerName: string;
  isMyTurn: boolean;
  activePlayer: Player | null;
}

export function PlayerGameControls({
  session,
  currentPlayer,
  playerName,
  isMyTurn,
  activePlayer,
}: PlayerGameControlsProps) {
  if (!session.gameState) return null;

  const handleEndTurn = () => {
    socket.emit('end-turn');
  };

  return (
    <div className="player-game-controls">
      <PlayerBadge player={currentPlayer} name={playerName} />

      <div className="turn-status">
        {isMyTurn ? (
          <h2 className="your-turn">Your Turn!</h2>
        ) : (
          <h2 className="waiting-turn">
            Waiting for <span className={activePlayer?.color}>{activePlayer?.name}</span>
          </h2>
        )}
        <TurnInfo turn={session.gameState.turn} variant="inline" />
      </div>

      {isMyTurn ? (
        <div className="action-area">
          <div className="actions-placeholder">
            <p>🎮 Your actions will appear here</p>
            <p className="hint">Perform your actions, then end your turn</p>
          </div>

          <button className="end-turn-btn" onClick={handleEndTurn}>
            End Turn
          </button>
        </div>
      ) : (
        <div className="waiting-area">
          <div className="waiting-message">
            <p>⏳ Wait for your turn...</p>
          </div>
        </div>
      )}
    </div>
  );
}

