import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  GameState, 
  Player, 
  ServerToClientEvents, 
  ClientToServerEvents 
} from '../types';

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  connected: boolean;
  gameState: GameState | null;
  currentPlayer: Player | null;
  error: string | null;
  gameId: string | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  gameState: null,
  currentPlayer: null,
  error: null,
  gameId: null
});

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    const newSocket = io(serverUrl);

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to server');
      setConnected(false);
    });

    // Game events
    newSocket.on('game-created', (data) => {
      console.log('Game created:', data);
      setGameId(data.gameId);
      setError(null);
    });

    newSocket.on('game-joined', (data) => {
      console.log('Game joined:', data);
      setGameState(data.gameState);
      setGameId(data.gameId);
      setError(null);
      
      // Find current player (this is simplified - in real app you'd track this better)
      // For now, assume the last player in the list is the current player
      const player = data.players[data.players.length - 1];
      setCurrentPlayer(player);
    });

    newSocket.on('game-started', (gameState) => {
      console.log('Game started:', gameState);
      setGameState(gameState);
      setError(null);
    });

    newSocket.on('player-joined', (player) => {
      console.log('Player joined:', player);
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: [...prev.players, player]
        };
      });
    });

    newSocket.on('player-left', (playerId) => {
      console.log('Player left:', playerId);
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.filter(p => p.id !== playerId)
        };
      });
    });

    newSocket.on('turn-started', (data) => {
      console.log('Turn started:', data);
      setGameState(data.gameState);
    });

    newSocket.on('move-made', (data) => {
      console.log('Move made:', data);
      setGameState(data.gameState);
      
      // Update current player if it's our move
      if (currentPlayer && data.player.id === currentPlayer.id) {
        setCurrentPlayer(data.player);
      }
    });

    newSocket.on('tsunami-triggered', (data) => {
      console.log('Tsunami triggered!', data);
      // You might want to show a special animation or notification here
    });

    newSocket.on('cards-drawn', (data) => {
      console.log('Cards drawn:', data);
      // Update the player who drew cards
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map(p => 
            p.id === data.playerId 
              ? { ...p, hand: [...p.hand] } // This would need the actual cards from server
              : p
          )
        };
      });
    });

    newSocket.on('game-ended', (data) => {
      console.log('Game ended:', data);
      // Handle game end - show results, etc.
    });

    newSocket.on('game-aborted', () => {
      console.log('Game aborted');
      setGameState(null);
      setCurrentPlayer(null);
      setGameId(null);
      setError('Game was aborted');
    });

    // Error events
    newSocket.on('game-error', (error) => {
      console.error('Game error:', error);
      setError(error);
    });

    newSocket.on('invalid-move', (error) => {
      console.error('Invalid move:', error);
      setError(`Invalid move: ${error}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Update current player when game state changes
  useEffect(() => {
    if (gameState && currentPlayer) {
      const updatedPlayer = gameState.players.find(p => p.id === currentPlayer.id);
      if (updatedPlayer) {
        setCurrentPlayer(updatedPlayer);
      }
    }
  }, [gameState, currentPlayer?.id]);

  const value: SocketContextType = {
    socket,
    connected,
    gameState,
    currentPlayer,
    error,
    gameId
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext };

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 