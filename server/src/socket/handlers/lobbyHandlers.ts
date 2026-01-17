import { sessionManager } from '../../session';
import { GameSocket, GameServer } from '../types';

export function registerLobbyHandlers(
  io: GameServer,
  socket: GameSocket,
  broadcastSessionState: () => void
): void {
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

    const session = sessionManager.getSession();
    const gameState = sessionManager.getPublicGameState();

    // Log deck info
    const fullState = sessionManager.getFullGameState();
    if (fullState) {
      console.log(`Deck created with ${fullState.deck.length + session.players.length * 5} cards, ${fullState.deck.length} remaining after dealing`);
    }

    io.emit('game-started');

    // Send each player their hand privately
    for (const player of session.players) {
      const hand = sessionManager.getPlayerHand(player.id);
      if (hand) {
        io.to(player.id).emit('hand-updated', hand);
        console.log(`Dealt ${hand.cards.length} cards to ${player.name}`);
      }
    }

    // Notify about first player's turn
    const currentPlayer = sessionManager.getCurrentPlayer();
    if (currentPlayer && gameState) {
      io.emit('turn-changed', {
        currentPlayerId: currentPlayer.id,
        turnNumber: gameState.turn.turnNumber,
        roundNumber: gameState.turn.roundNumber,
      });
    }

    broadcastSessionState();
  });
}
