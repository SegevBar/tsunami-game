import { sessionManager } from '../../session';
import { GameSocket, GameServer } from '../types';

export function registerConnectionHandlers(
  io: GameServer,
  socket: GameSocket
): void {
  // Handle leaving session
  socket.on('leave-session', () => {
    handleDisconnect(io, socket);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    handleDisconnect(io, socket);
  });
}

function handleDisconnect(io: GameServer, socket: GameSocket): void {
  const { type, playerId } = sessionManager.removeClient(socket.id);

  if (type === 'host') {
    console.log('Host disconnected');
    io.emit('host-disconnected');
  } else if (type === 'player' && playerId) {
    console.log(`Player disconnected: ${playerId}`);
    io.emit('player-left', playerId);
  }

  io.emit('session-state', sessionManager.getSession());
  console.log(`Client disconnected: ${socket.id}`);
}

