import { GameSession } from '../../types';
import { PlayerLobby } from '../Lobby';
import { PlayerGameControls, GameFinished } from '../GameBoard';
import './PlayerView.scss';

interface PlayerViewProps {
  session: GameSession;
  playerName: string;
}

export function PlayerView({ session, playerName }: PlayerViewProps) {
  const currentPlayer = session.players.find((p) => p.name === playerName);
  const currentPlayerIndex = session.players.findIndex((p) => p.name === playerName);

  const isMyTurn = session.gameState
    ? session.gameState.turn.currentPlayerIndex === currentPlayerIndex
    : false;

  const activePlayer = session.gameState
    ? session.players[session.gameState.turn.currentPlayerIndex]
    : null;

  return (
    <div className="player-view">
      {session.phase === 'lobby' && (
        <PlayerLobby
          session={session}
          currentPlayer={currentPlayer}
          playerName={playerName}
        />
      )}

      {session.phase === 'playing' && session.gameState && (
        <PlayerGameControls
          session={session}
          currentPlayer={currentPlayer}
          playerName={playerName}
          isMyTurn={isMyTurn}
          activePlayer={activePlayer}
        />
      )}

      {session.phase === 'finished' && (
        <GameFinished isHost={false} />
      )}
    </div>
  );
}
