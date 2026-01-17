import { useEffect, useState } from 'react';
import { socket } from './socket';
import './App.scss';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log('Connected to server');
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log('Disconnected from server');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🌊 Tsunami Game</h1>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '● Connected' : '○ Disconnected'}
        </div>
      </header>
      <main className="main">
        <p>Game infrastructure ready!</p>
        <p>Socket ID: {socket.id || 'Not connected'}</p>
      </main>
    </div>
  );
}

export default App;

