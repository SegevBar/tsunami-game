import { GameSession, Player, PlayerHand } from '../../../../types';
import { socket } from '../../../../socket';
import { PlayerBadge, TurnInfo } from '../../../shared';
import { HandDisplay } from '../../cards';
import './PlayerGameControls.scss';

interface PlayerGameControlsProps {
  session: GameSession;
  currentPlayer: Player | undefined;
  playerName: string;
  isMyTurn: boolean;
  activePlayer: Player | null;
  hand: PlayerHand | null;
}

export function PlayerGameControls({
  session,
  currentPlayer,
  playerName,
  isMyTurn,
  activePlayer,
  hand,
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

      <div className="hand-section">
        <h3>Your Hand</h3>
        {hand ? (
          <HandDisplay cards={hand.cards} />
        ) : (
          <div className="no-hand">Loading hand...</div>
        )}
      </div>

      {isMyTurn ? (
        <div className="action-area">
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
