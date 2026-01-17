import { useEffect, useState } from 'react';
import { socket } from './socket';
import { GameSession, ClientType, createInitialSession } from './types';
import { RoleSelection } from './components/RoleSelection';
import { HostView } from './components/HostView';
import { PlayerView } from './components/PlayerView';
import './App.scss';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [session, setSession] = useState<GameSession>(createInitialSession());
  const [role, setRole] = useState<ClientType | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onSessionState(newSession: GameSession) {
      setSession(newSession);
    }

    function onJoinError({ message }: { message: string }) {
      setError(message);
      setTimeout(() => setError(null), 3000);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('session-state', onSessionState);
    socket.on('join-error', onJoinError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('session-state', onSessionState);
      socket.off('join-error', onJoinError);
    };
  }, []);

  const handleJoinAsHost = () => {
    socket.emit('join-as-host');
    setRole('host');
  };

  const handleJoinAsPlayer = (name: string) => {
    socket.emit('join-as-player', { name });
    setPlayerName(name);
    setRole('player');
  };

  const handleLeave = () => {
    socket.emit('leave-session');
    setRole(null);
    setPlayerName('');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🌊 Tsunami Game</h1>
        <div className="header-right">
          {role && (
            <button className="leave-btn" onClick={handleLeave}>
              Leave
            </button>
          )}
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </div>
        </div>
      </header>

      {error && <div className="error-toast">{error}</div>}

      <main className="main">
        {!role ? (
          <RoleSelection
            session={session}
            onJoinAsHost={handleJoinAsHost}
            onJoinAsPlayer={handleJoinAsPlayer}
          />
        ) : role === 'host' ? (
          <HostView session={session} />
        ) : (
          <PlayerView session={session} playerName={playerName} />
        )}
      </main>
    </div>
  );
}

export default App;
