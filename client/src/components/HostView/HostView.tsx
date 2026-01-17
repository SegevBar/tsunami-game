import { GameSession } from '../../types';
import { HostLobby } from '../Lobby';
import { HostGameBoard, GameFinished } from '../GameBoard';
import './HostView.scss';

interface HostViewProps {
  session: GameSession;
}

export function HostView({ session }: HostViewProps) {
  const currentPlayer = session.gameState
    ? session.players[session.gameState.turn.currentPlayerIndex]
    : null;

  return (
    <div className="host-view">
      {session.phase === 'lobby' && (
        <HostLobby session={session} />
      )}

      {session.phase === 'playing' && session.gameState && (
        <HostGameBoard session={session} currentPlayer={currentPlayer} />
      )}

      {session.phase === 'finished' && (
        <GameFinished isHost />
      )}
    </div>
  );
}
