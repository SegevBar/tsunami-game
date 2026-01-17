import './Header.scss';

interface HeaderProps {
  isConnected: boolean;
  showLeaveButton: boolean;
  onLeave: () => void;
}

export function Header({ isConnected, showLeaveButton, onLeave }: HeaderProps) {
  return (
    <header className="header">
      <h1>🌊 Tsunami Game</h1>
      <div className="header-right">
        {showLeaveButton && (
          <button className="leave-btn" onClick={onLeave}>
            Leave
          </button>
        )}
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '● Connected' : '○ Disconnected'}
        </div>
      </div>
    </header>
  );
}

