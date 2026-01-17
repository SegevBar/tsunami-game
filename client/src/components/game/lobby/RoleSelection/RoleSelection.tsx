import { useState } from 'react';
import { GameSession } from '../../../../types';
import './RoleSelection.scss';

interface RoleSelectionProps {
  session: GameSession;
  onJoinAsHost: () => void;
  onJoinAsPlayer: (name: string) => void;
}

export function RoleSelection({ session, onJoinAsHost, onJoinAsPlayer }: RoleSelectionProps) {
  const [playerName, setPlayerName] = useState('');

  const handlePlayerJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onJoinAsPlayer(playerName.trim());
    }
  };

  const canJoinAsHost = !session.hostConnected;
  const canJoinAsPlayer = session.players.length < session.maxPlayers && session.phase === 'lobby';

  return (
    <div className="role-selection">
      <h2>Join the Game</h2>

      <div className="role-cards">
        <div className={`role-card host ${!canJoinAsHost ? 'disabled' : ''}`}>
          <div className="role-icon">🖥️</div>
          <h3>Host Display</h3>
          <p>Show the game board on a shared screen</p>
          <button onClick={onJoinAsHost} disabled={!canJoinAsHost}>
            {canJoinAsHost ? 'Join as Host' : 'Host Connected'}
          </button>
        </div>

        <div className={`role-card player ${!canJoinAsPlayer ? 'disabled' : ''}`}>
          <div className="role-icon">🎮</div>
          <h3>Player</h3>
          <p>Join as a player ({session.players.length}/{session.maxPlayers})</p>
          <form onSubmit={handlePlayerJoin}>
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={!canJoinAsPlayer}
              maxLength={20}
            />
            <button type="submit" disabled={!canJoinAsPlayer || !playerName.trim()}>
              {canJoinAsPlayer ? 'Join as Player' : session.phase !== 'lobby' ? 'Game in Progress' : 'Game Full'}
            </button>
          </form>
        </div>
      </div>

      {session.players.length > 0 && (
        <div className="current-players">
          <h4>Players in Lobby</h4>
          <div className="player-list">
            {session.players.map((player) => (
              <div key={player.id} className={`player-chip ${player.color}`}>
                {player.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

