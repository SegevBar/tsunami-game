import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../types';

export type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

