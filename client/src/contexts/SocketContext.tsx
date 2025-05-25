import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  SocketContextType,
  GameState,
  PlayerInfo,
  PlayerData,
  MoveData,
  ServerToClientEvents,
  ClientToServerEvents
} from '../types';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'
    );
    
    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from server');
    });

    // Game event listeners
    newSocket.on('player-joined', (data) => {
      setPlayerId(data.playerId);
      setGameState(data.gameState);
      setPlayers(data.players);
    });

    newSocket.on('board-connected', (data) => {
      setGameState(data.gameState);
      setPlayers(data.players);
    });

    newSocket.on('player-connected', (data) => {
      setPlayers(prev => [...prev, data.player]);
    });

    newSocket.on('player-disconnected', (data) => {
      setPlayers(prev => prev.filter(p => p.id !== data.playerId));
    });

    newSocket.on('player-moved', (data) => {
      setGameState(data.gameState);
      setPlayers(prev => prev.map(p => 
        p.id === data.playerId 
          ? { ...p, position: data.moveData.position }
          : p
      ));
    });

    newSocket.on('game-started', (data) => {
      setGameState(data.gameState);
    });

    newSocket.on('game-reset', (data) => {
      setGameState(data.gameState);
    });

    newSocket.on('invalid-move', (data) => {
      console.warn('Invalid move:', data.reason);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinAsPlayer = (playerData: PlayerData): void => {
    if (socket) {
      socket.emit('join-game', playerData);
    }
  };

  const joinAsBoard = (): void => {
    if (socket) {
      socket.emit('join-as-board');
    }
  };

  const makeMove = (moveData: MoveData): void => {
    if (socket) {
      socket.emit('player-move', moveData);
    }
  };

  const value: SocketContextType = {
    socket,
    connected,
    gameState,
    players,
    playerId,
    joinAsPlayer,
    joinAsBoard,
    makeMove
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 