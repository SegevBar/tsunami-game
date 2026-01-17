import { GameSession, Player } from '../../types';
import { TurnInfo } from '../TurnInfo';
import './HostGameBoard.scss';

interface HostGameBoardProps {
  session: GameSession;
  currentPlayer: Player | null;
}

export function HostGameBoard({ session, currentPlayer }: HostGameBoardProps) {
  if (!session.gameState) return null;

  return (
    <div className="host-game-board">
      <TurnInfo turn={session.gameState.turn} />

      <div className="current-turn">
        <span className="turn-label">Current Turn:</span>
        {currentPlayer && (
          <div className={`current-player ${currentPlayer.color}`}>
            <span className="player-avatar">{currentPlayer.name.charAt(0).toUpperCase()}</span>
            <span className="player-name">{currentPlayer.name}</span>
          </div>
        )}
      </div>

      <div className="board-placeholder">
        <p>🎮 Game board will be displayed here</p>
      </div>

      <div className="players-bar">
        {session.players.map((player, index) => (
          <div
            key={player.id}
            className={`player-indicator ${player.color} ${index === session.gameState!.turn.currentPlayerIndex ? 'active' : ''}`}
          >
            {player.name}
            {index === session.gameState!.turn.currentPlayerIndex && <span className="turn-marker">◀</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

