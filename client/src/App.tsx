import { useGameSession, usePlayerRole } from './hooks';
import { Header, ErrorToast, RoleSelection, HostView, PlayerView } from './components';
import './App.scss';

function App() {
  const { isConnected, session, hand, error, clearHand } = useGameSession();
  const { role, playerName, joinAsHost, joinAsPlayer, leave } = usePlayerRole(clearHand);

  return (
    <div className="app">
      <Header
        isConnected={isConnected}
        showLeaveButton={!!role}
        onLeave={leave}
      />

      <ErrorToast message={error} />

      <main className="main">
        {!role ? (
          <RoleSelection
            session={session}
            onJoinAsHost={joinAsHost}
            onJoinAsPlayer={joinAsPlayer}
          />
        ) : role === 'host' ? (
          <HostView session={session} />
        ) : (
          <PlayerView session={session} playerName={playerName} hand={hand} />
        )}
      </main>
    </div>
  );
}

export default App;
