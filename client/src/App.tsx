import { Routes, Route } from 'react-router-dom';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import GameLobby from './components/GameLobby';
import GameView from './components/GameView';
import Home from './components/Home';
import './App.css';

function GameRouter(): JSX.Element {
  const { gameState, currentPlayer, connected, socket } = useSocket();

  const handleStartGame = () => {
    if (socket && gameState) {
      socket.emit('start-game', gameState.id);
    }
  };

  if (!connected) {
    return (
      <div className="app-loading">
        <h2>🌊 Tsunami Card Game</h2>
        <p>Connecting to server...</p>
      </div>
    );
  }

  // If we have a game state and current player, show the game
  if (gameState && currentPlayer) {
    if (gameState.status === 'waiting') {
      // Show lobby/waiting room
      return (
        <div className="game-waiting">
          <div className="waiting-info">
            <h2>Game Lobby - {gameState.id}</h2>
            <p>Waiting for players... ({gameState.players.length}/{gameState.maxPlayers})</p>
            <div className="player-list">
              {gameState.players.map(player => (
                <div key={player.id} className="player-item">
                  {player.nickname} {player.id === currentPlayer.id && '(You)'}
                </div>
              ))}
            </div>
            {gameState.createdBy === currentPlayer.id && gameState.players.length >= 2 && (
              <button 
                className="btn btn-primary"
                onClick={handleStartGame}
              >
                Start Game ({gameState.players.length} players)
              </button>
            )}
            {gameState.createdBy !== currentPlayer.id && (
              <p className="waiting-message">
                Waiting for {gameState.players.find(p => p.id === gameState.createdBy)?.nickname} to start the game...
              </p>
            )}
          </div>
        </div>
      );
    } else if (gameState.status === 'playing') {
      return <GameView gameState={gameState} currentPlayer={currentPlayer} />;
    } else if (gameState.status === 'finished') {
      // Show game results
      return (
        <div className="game-finished">
          <h2>Game Finished!</h2>
          {/* Add game results here */}
        </div>
      );
    }
  }

  // Default to lobby
  return <GameLobby />;
}

function App(): JSX.Element {
  return (
    <SocketProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<GameRouter />} />
          {/* Keep old routes for backward compatibility */}
          <Route path="/player" element={<GameRouter />} />
          <Route path="/board" element={<GameRouter />} />
        </Routes>
      </div>
    </SocketProvider>
  );
}

export default App; 