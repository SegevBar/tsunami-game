import './GameFinished.scss';

interface GameFinishedProps {
  isHost: boolean;
}

export function GameFinished({ isHost }: GameFinishedProps) {
  return (
    <div className="game-finished">
      <h2>Game Finished</h2>
      <p>{isHost ? 'Results will be shown here' : 'Check the host screen for results'}</p>
    </div>
  );
}

