import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from './types';

const SERVER_URL = 'http://localhost:3001';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: true,
});
