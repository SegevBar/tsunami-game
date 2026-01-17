import { GameSession, Player } from '../../../../types';
import { TurnInfo } from '../../../shared';
import './HostGameBoard.scss';

interface HostGameBoardProps {
  session: GameSession;
  currentPlayer: Player | null;
}

export function HostGameBoard({ session, currentPlayer }: HostGameBoardProps) {
  if (!session.gameState) return null;

  const getPlayerCardCount = (playerId: string): number => {
    const handInfo = session.gameState?.hands.find((h) => h.playerId === playerId);
    return handInfo?.cardCount ?? 0;
  };

  const { cardsUntilNextTsunami } = session.gameState;

  return (
    <div className="host-game-board">
      <div className="game-info-bar">
        <TurnInfo turn={session.gameState.turn} />
        <div className="deck-info">
          <span className="deck-icon">🃏</span>
          <span className="deck-count">{session.gameState.deckCount} cards in deck</span>
        </div>
        <div className={`tsunami-warning ${cardsUntilNextTsunami !== null && cardsUntilNextTsunami <= 5 ? 'imminent' : ''}`}>
          <span className="tsunami-icon">🌊</span>
          {cardsUntilNextTsunami !== null ? (
            <span className="tsunami-count">{cardsUntilNextTsunami} cards until tsunami</span>
          ) : (
            <span className="tsunami-count">No more tsunamis</span>
          )}
        </div>
      </div>

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
        {session.players.map((player, index) => {
          const cardCount = getPlayerCardCount(player.id);
          const isActive = index === session.gameState!.turn.currentPlayerIndex;

          return (
            <div
              key={player.id}
              className={`player-indicator ${player.color} ${isActive ? 'active' : ''}`}
            >
              <div className="player-info">
                <span className="player-name">{player.name}</span>
                <span className="card-count">{cardCount} cards</span>
              </div>
              {isActive && <span className="turn-marker">◀</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
