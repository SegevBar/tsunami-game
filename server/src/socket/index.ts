import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { ClientToServerEvents, ServerToClientEvents } from '../types';
import { config } from '../config';
import { registerSocketHandlers } from './handlers';
import { GameServer } from './types';

export function createSocketServer(httpServer: HttpServer): GameServer {
  const io: GameServer = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: config.cors,
  });

  io.on('connection', (socket) => {
    registerSocketHandlers(io, socket);
  });

  return io;
}

