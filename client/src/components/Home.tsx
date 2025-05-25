import { Link } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';

const Home: React.FC = () => {
  const { connected } = useSocket();

  return (
    <div className="home">
      <h1>🌊 Tsunami Game</h1>
      <div className="connection-status">
        Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
      <div className="navigation">
        <div className="nav-card">
          <h2>🎮 Join as Player</h2>
          <p>Play the game and compete with other players</p>
          <Link to="/player" className="nav-button player-button">
            Join Game
          </Link>
        </div>
        
        <div className="nav-card">
          <h2>📺 Game Board View</h2>
          <p>Watch the game and see all players in action</p>
          <Link to="/board" className="nav-button board-button">
            View Board
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 