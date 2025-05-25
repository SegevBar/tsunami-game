import React, { useState, useContext } from 'react';
import { SocketContext } from '../contexts/SocketContext';
import { CreateGameData, JoinGameData } from '../types';

const GameLobby: React.FC = () => {
  const { socket, connected } = useContext(SocketContext);
  const [view, setView] = useState<'menu' | 'create' | 'join'>('menu');
  const [createData, setCreateData] = useState<CreateGameData>({
    maxPlayers: 4,
    nickname: '',
    email: ''
  });
  const [joinData, setJoinData] = useState<JoinGameData>({
    gameId: '',
    nickname: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !socket) {
      setError('Not connected to server');
      return;
    }

    if (!createData.nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      socket.emit('create-game', {
        maxPlayers: createData.maxPlayers,
        nickname: createData.nickname.trim(),
        email: createData.email.trim() || undefined
      });
    } catch (err) {
      setError('Failed to create game');
      setLoading(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !socket) {
      setError('Not connected to server');
      return;
    }

    if (!joinData.nickname.trim() || !joinData.gameId.trim()) {
      setError('Please enter both nickname and game ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      socket.emit('join-game', {
        gameId: joinData.gameId.trim(),
        nickname: joinData.nickname.trim(),
        email: joinData.email.trim() || undefined
      });
    } catch (err) {
      setError('Failed to join game');
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="game-lobby">
        <div className="connection-status">
          <h2>🌊 Tsunami Card Game</h2>
          <p>Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-lobby">
      <div className="lobby-container">
        <h1>🌊 Tsunami Card Game</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {view === 'menu' && (
          <div className="lobby-menu">
            <div className="menu-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => setView('create')}
                disabled={loading}
              >
                Create New Game
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setView('join')}
                disabled={loading}
              >
                Join Existing Game
              </button>
            </div>
            
            <div className="game-rules">
              <h3>How to Play</h3>
              <ul>
                <li>Build and protect your neighborhood with cards</li>
                <li>Use foundation cards for protection</li>
                <li>Attack other players buildings</li>
                <li>Survive the tsunami waves!</li>
                <li>Player with the most cards wins</li>
              </ul>
            </div>
          </div>
        )}

        {view === 'create' && (
          <div className="create-game">
            <h2>Create New Game</h2>
            <form onSubmit={handleCreateGame}>
              <div className="form-group">
                <label htmlFor="nickname">Your Nickname:</label>
                <input
                  type="text"
                  id="nickname"
                  value={createData.nickname}
                  onChange={(e) => setCreateData({...createData, nickname: e.target.value})}
                  placeholder="Enter your nickname"
                  maxLength={20}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email (optional):</label>
                <input
                  type="email"
                  id="email"
                  value={createData.email}
                  onChange={(e) => setCreateData({...createData, email: e.target.value})}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxPlayers">Max Players:</label>
                <select
                  id="maxPlayers"
                  value={createData.maxPlayers}
                  onChange={(e) => setCreateData({...createData, maxPlayers: parseInt(e.target.value)})}
                >
                  <option value={2}>2 Players</option>
                  <option value={3}>3 Players</option>
                  <option value={4}>4 Players (Recommended)</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Game'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setView('menu')}
                  disabled={loading}
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'join' && (
          <div className="join-game">
            <h2>Join Game</h2>
            <form onSubmit={handleJoinGame}>
              <div className="form-group">
                <label htmlFor="gameId">Game ID:</label>
                <input
                  type="text"
                  id="gameId"
                  value={joinData.gameId}
                  onChange={(e) => setJoinData({...joinData, gameId: e.target.value})}
                  placeholder="Enter 6-digit game ID"
                  maxLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="joinNickname">Your Nickname:</label>
                <input
                  type="text"
                  id="joinNickname"
                  value={joinData.nickname}
                  onChange={(e) => setJoinData({...joinData, nickname: e.target.value})}
                  placeholder="Enter your nickname"
                  maxLength={20}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="joinEmail">Email (optional):</label>
                <input
                  type="email"
                  id="joinEmail"
                  value={joinData.email}
                  onChange={(e) => setJoinData({...joinData, email: e.target.value})}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Joining...' : 'Join Game'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setView('menu')}
                  disabled={loading}
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLobby; 