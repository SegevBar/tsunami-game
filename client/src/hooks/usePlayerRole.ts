import { useState } from 'react';
import { socket } from '../socket';
import { ClientType } from '../types';

export function usePlayerRole(onLeave?: () => void) {
  const [role, setRole] = useState<ClientType | null>(null);
  const [playerName, setPlayerName] = useState('');

  const joinAsHost = () => {
    socket.emit('join-as-host');
    setRole('host');
  };

  const joinAsPlayer = (name: string) => {
    socket.emit('join-as-player', { name });
    setPlayerName(name);
    setRole('player');
  };

  const leave = () => {
    socket.emit('leave-session');
    setRole(null);
    setPlayerName('');
    onLeave?.();
  };

  return {
    role,
    playerName,
    joinAsHost,
    joinAsPlayer,
    leave,
  };
}

