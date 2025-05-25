import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="home">
      <div className="home-container">
        <h1>🌊 Tsunami Card Game</h1>
        <p className="home-description">
          Build your neighborhood, protect your buildings, and survive the tsunami waves!
        </p>
        
        <div className="home-actions">
          <Link to="/game" className="btn btn-primary btn-large">
            Play Game
          </Link>
        </div>

        <div className="game-info">
          <h2>How to Play</h2>
          <div className="rules-grid">
            <div className="rule-item">
              <h3>🏗️ Build</h3>
              <p>Use foundation cards to start buildings and regular cards to make them taller.</p>
            </div>
            <div className="rule-item">
              <h3>🛡️ Protect</h3>
              <p>Foundation cards provide temporary protection, roof cards give permanent protection.</p>
            </div>
            <div className="rule-item">
              <h3>⚔️ Attack</h3>
              <p>Attack other players unprotected buildings with matching color cards.</p>
            </div>
            <div className="rule-item">
              <h3>🌊 Survive</h3>
              <p>When tsunami cards appear, all cards below the tsunami value are destroyed!</p>
            </div>
          </div>
        </div>

        <div className="game-features">
          <h2>Features</h2>
          <ul>
            <li>Real-time multiplayer gameplay</li>
            <li>2-4 players per game</li>
            <li>Strategic card play and building management</li>
            <li>Dynamic tsunami events</li>
            <li>Beautiful card-based interface</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home; 