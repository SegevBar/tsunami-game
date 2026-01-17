import { sessionManager } from '../session';
import { GameSocket, GameServer } from './types';
import {
  registerLobbyHandlers,
  registerGameHandlers,
  registerConnectionHandlers,
} from './handlers/index';

export function registerSocketHandlers(io: GameServer, socket: GameSocket): void {
  const broadcastSessionState = () => {
    io.emit('session-state', sessionManager.getSession());
  };

  // Send current session state to newly connected client
  socket.emit('session-state', sessionManager.getSession());
  console.log(`Client connected: ${socket.id}`);

  // Register handlers by concern
  registerLobbyHandlers(io, socket, broadcastSessionState);
  registerGameHandlers(io, socket, broadcastSessionState);
  registerConnectionHandlers(io, socket);
}
