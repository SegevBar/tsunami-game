import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { ClientToServerEvents, ServerToClientEvents } from '../types';
import { config } from '../config';
import { registerSocketHandlers } from './handlers';

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: config.cors,
  });

  io.on('connection', (socket) => {
    registerSocketHandlers(io, socket);
  });

  return io;
}

