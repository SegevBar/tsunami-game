import { Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext.tsx';
import PlayerView from './components/PlayerView.tsx';
import BoardView from './components/BoardView.tsx';
import Home from './components/Home.tsx';
import './App.css';

function App(): JSX.Element {
  return (
    <SocketProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/player" element={<PlayerView />} />
          <Route path="/board" element={<BoardView />} />
        </Routes>
      </div>
    </SocketProvider>
  );
}

export default App; 