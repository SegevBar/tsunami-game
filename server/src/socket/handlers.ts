import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../types';
import { sessionManager } from '../session';

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerSocketHandlers(io: GameServer, socket: GameSocket): void {
  const broadcastSessionState = () => {
    io.emit('session-state', sessionManager.getSession());
  };

  // Send current session state to newly connected client
  socket.emit('session-state', sessionManager.getSession());
  console.log(`Client connected: ${socket.id}`);

  // Handle host joining
  socket.on('join-as-host', () => {
    if (!sessionManager.addHost(socket.id)) {
      socket.emit('join-error', { message: 'Host already connected' });
      return;
    }

    console.log(`Host connected: ${socket.id}`);
    io.emit('host-connected');
    broadcastSessionState();
  });

  // Handle player joining
  socket.on('join-as-player', ({ name }) => {
    const canJoin = sessionManager.canJoinAsPlayer();
    if (!canJoin.allowed) {
      socket.emit('join-error', { message: canJoin.reason! });
      return;
    }

    const player = sessionManager.addPlayer(socket.id, name);
    if (!player) {
      socket.emit('join-error', { message: 'No colors available' });
      return;
    }

    console.log(`Player joined: ${player.name} (${player.color})`);
    io.emit('player-joined', player);
    broadcastSessionState();
  });

  // Handle game start (only host can start)
  socket.on('start-game', () => {
    if (sessionManager.getClientType(socket.id) !== 'host') {
      socket.emit('join-error', { message: 'Only host can start the game' });
      return;
    }

    const canStart = sessionManager.canStartGame();
    if (!canStart.allowed) {
      socket.emit('join-error', { message: canStart.reason! });
      return;
    }

    sessionManager.startGame();
    console.log('Game started!');
    io.emit('game-started');
    broadcastSessionState();
  });

  // Handle game actions from players
  socket.on('player-action', ({ action }) => {
    if (sessionManager.getClientType(socket.id) !== 'player') {
      return;
    }

    const playerId = sessionManager.getPlayerId(socket.id);
    if (!playerId) return;

    io.emit('game-action', { playerId, action });
  });

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

