import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { GameSession, PlayerHand, createInitialSession } from '../types';

export function useGameSession() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [session, setSession] = useState<GameSession>(createInitialSession());
  const [hand, setHand] = useState<PlayerHand | null>(null);
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

    function onHandUpdated(newHand: PlayerHand) {
      setHand(newHand);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('session-state', onSessionState);
    socket.on('join-error', onJoinError);
    socket.on('hand-updated', onHandUpdated);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('session-state', onSessionState);
      socket.off('join-error', onJoinError);
      socket.off('hand-updated', onHandUpdated);
    };
  }, []);

  const clearHand = () => setHand(null);
  const clearError = () => setError(null);

  return {
    isConnected,
    session,
    hand,
    error,
    clearHand,
    clearError,
  };
}

