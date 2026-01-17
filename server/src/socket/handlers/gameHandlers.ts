import { sessionManager } from '../../session';
import { GameSocket, GameServer } from '../types';

export function registerGameHandlers(
  io: GameServer,
  socket: GameSocket,
  broadcastSessionState: () => void
): void {
  // Handle end turn
  socket.on('end-turn', () => {
    const playerId = sessionManager.getPlayerId(socket.id);
    if (!playerId) {
      socket.emit('action-error', { message: 'Not a player' });
      return;
    }

    if (!sessionManager.isPlayerTurn(playerId)) {
      socket.emit('action-error', { message: 'Not your turn' });
      return;
    }

    const result = sessionManager.endTurn();
    if (!result) {
      socket.emit('action-error', { message: 'Cannot end turn' });
      return;
    }

    console.log(`Turn ended. Next player: ${result.nextPlayer.name} (Turn ${result.turnNumber}, Round ${result.roundNumber})`);

    io.emit('turn-changed', {
      currentPlayerId: result.nextPlayer.id,
      turnNumber: result.turnNumber,
      roundNumber: result.roundNumber,
    });

    broadcastSessionState();
  });

  // Handle game actions from players
  socket.on('player-action', ({ action }) => {
    const playerId = sessionManager.getPlayerId(socket.id);
    if (!playerId) {
      socket.emit('action-error', { message: 'Not a player' });
      return;
    }

    if (!sessionManager.isPlayerTurn(playerId)) {
      socket.emit('action-error', { message: 'Not your turn' });
      return;
    }

    // Broadcast the action to all clients
    io.emit('game-action', { playerId, action });
    broadcastSessionState();
  });
}

