import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { TsunamiGameLogic } from './gameLogic.js';
import { UserService } from './services/userService.js';
import { GameService } from './services/gameService.js';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  GameSocket,
  GameState,
  Player,
  GameMove,
  PlayerData,
  MoveData
} from './types.js';

export class GameManager {
  private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private games: Map<string, GameState> = new Map();
  private playerToGame: Map<string, string> = new Map(); // playerId -> gameId
  private socketToPlayer: Map<string, string> = new Map(); // socketId -> playerId
  private userService: UserService;
  private gameService: GameService;

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
    this.io = io;
    this.userService = UserService.getInstance();
    this.gameService = GameService.getInstance();
  }

  // Game Creation
  async createGame(socket: GameSocket, data: { maxPlayers: number; nickname: string; email?: string }): Promise<void> {
    try {
      const gameId = this.generateGameId();
      const playerId = uuidv4();
      
      // Create player
      const player = TsunamiGameLogic.createPlayer(playerId, socket.id, data.nickname, data.email);
      
      // Create game state
      const gameState: GameState = {
        id: gameId,
        players: [player],
        currentPlayerIndex: 0,
        deck: [],
        discardPile: [],
        maxPlayers: data.maxPlayers,
        status: 'waiting',
        turnOrder: [],
        createdBy: playerId,
        createdAt: new Date(),
        tsunamiNumbers: []
      };

      // Store game and player mappings
      this.games.set(gameId, gameState);
      this.playerToGame.set(playerId, gameId);
      this.socketToPlayer.set(socket.id, playerId);
      
      // Update socket data
      socket.data.playerId = playerId;
      socket.data.gameId = gameId;

      // Join socket room
      socket.join(gameId);

      // Notify client
      socket.emit('game-created', { gameId, maxPlayers: data.maxPlayers });
      socket.emit('game-joined', { gameId, players: gameState.players, gameState });

      console.log(`Game ${gameId} created by ${data.nickname} (${playerId})`);
    } catch (error) {
      console.error('Error creating game:', error);
      socket.emit('game-error', 'Failed to create game');
    }
  }

  // Game Joining
  async joinGame(socket: GameSocket, data: { gameId: string; nickname: string; email?: string }): Promise<void> {
    try {
      const gameState = this.games.get(data.gameId);
      if (!gameState) {
        socket.emit('game-error', 'Game not found');
        return;
      }

      if (gameState.status !== 'waiting') {
        socket.emit('game-error', 'Game already started');
        return;
      }

      if (gameState.players.length >= gameState.maxPlayers) {
        socket.emit('game-error', 'Game is full');
        return;
      }

      const playerId = uuidv4();
      const player = TsunamiGameLogic.createPlayer(playerId, socket.id, data.nickname, data.email);

      // Add player to game
      gameState.players.push(player);
      
      // Store mappings
      this.playerToGame.set(playerId, data.gameId);
      this.socketToPlayer.set(socket.id, playerId);
      
      // Update socket data
      socket.data.playerId = playerId;
      socket.data.gameId = data.gameId;

      // Join socket room
      socket.join(data.gameId);

      // Notify all players
      this.io.to(data.gameId).emit('player-joined', player);
      socket.emit('game-joined', { gameId: data.gameId, players: gameState.players, gameState });

      console.log(`Player ${data.nickname} (${playerId}) joined game ${data.gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('game-error', 'Failed to join game');
    }
  }

  // Game Starting
  async startGame(socket: GameSocket, gameId: string): Promise<void> {
    try {
      const gameState = this.games.get(gameId);
      if (!gameState) {
        socket.emit('game-error', 'Game not found');
        return;
      }

      const playerId = socket.data.playerId;
      if (gameState.createdBy !== playerId) {
        socket.emit('game-error', 'Only game creator can start the game');
        return;
      }

      if (gameState.status !== 'waiting') {
        socket.emit('game-error', 'Game already started');
        return;
      }

      if (gameState.players.length < 2) {
        socket.emit('game-error', 'Need at least 2 players to start');
        return;
      }

      // Initialize game
      const initializedGame = TsunamiGameLogic.initializeGame(
        gameId,
        gameState.players,
        gameState.maxPlayers,
        gameState.createdBy
      );

      // Update stored game state
      this.games.set(gameId, initializedGame);

      // Notify all players
      this.io.to(gameId).emit('game-started', initializedGame);
      
      // Start first turn
      const currentPlayer = initializedGame.players[initializedGame.currentPlayerIndex];
      this.io.to(gameId).emit('turn-started', { currentPlayer, gameState: initializedGame });

      // Save game session to database
      await this.gameService.createGameSession({
        gameId,
        players: initializedGame.players.map(p => ({ playerId: p.id, nickname: p.nickname })),
        startedAt: new Date(),
        maxPlayers: initializedGame.maxPlayers
      });

      console.log(`Game ${gameId} started with ${initializedGame.players.length} players`);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('game-error', 'Failed to start game');
    }
  }

  // Move Handling
  async handleMove(socket: GameSocket, data: MoveData): Promise<void> {
    try {
      const gameState = this.games.get(data.gameId);
      if (!gameState) {
        socket.emit('game-error', 'Game not found');
        return;
      }

      const playerId = socket.data.playerId;
      if (!playerId) {
        socket.emit('game-error', 'Player not found');
        return;
      }

      if (gameState.status !== 'playing') {
        socket.emit('game-error', 'Game not in progress');
        return;
      }

      // Validate move
      const validation = TsunamiGameLogic.validateMove(gameState, playerId, data.move);
      if (!validation.isValid) {
        socket.emit('invalid-move', validation.error || 'Invalid move');
        return;
      }

      // Execute move
      if (data.move.type === 'end-turn') {
        await this.handleEndTurn(gameState, playerId, data.gameId);
      } else {
        TsunamiGameLogic.executeMove(gameState, playerId, data.move);
        
        // Notify all players of the move
        const player = gameState.players.find(p => p.id === playerId);
        if (player) {
          this.io.to(data.gameId).emit('move-made', { 
            move: data.move, 
            gameState, 
            player 
          });
        }
      }

      // Save move to database (simplified for now)
      // await this.gameService.addMoveToSession(data.gameId, {
      //   playerId,
      //   move: data.move,
      //   timestamp: new Date()
      // });

    } catch (error) {
      console.error('Error handling move:', error);
      socket.emit('game-error', 'Failed to process move');
    }
  }

  private async handleEndTurn(gameState: GameState, playerId: string, gameId: string): Promise<void> {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;
    
    // Execute end turn and get draw result
    const drawResult = TsunamiGameLogic.executeMove(gameState, playerId, { type: 'end-turn' }) as any;
    
    // Check for tsunami
    if (drawResult.tsunamiTriggered) {
      const tsunamiCard = drawResult.tsunamiTriggered;
      const destroyedCards = TsunamiGameLogic.executeTsunami(gameState, tsunamiCard.value);
      
      // Notify all players of tsunami
      this.io.to(gameId).emit('tsunami-triggered', {
        tsunamiValue: tsunamiCard.value,
        destroyedCards
      });
    }

    // Notify about cards drawn
    if (drawResult.drawnCards.length > 0) {
      this.io.to(gameId).emit('cards-drawn', {
        playerId,
        cardsCount: drawResult.drawnCards.length
      });
    }

    // Check if player becomes idle
    if (gameState.deck.length === 0 && drawResult.drawnCards.length === 0) {
      player.isIdle = true;
    }

    // Check for game end
    if (TsunamiGameLogic.checkGameEnd(gameState)) {
      await this.endGame(gameState, gameId);
      return;
    }

    // Start next turn
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    this.io.to(gameId).emit('turn-started', { currentPlayer, gameState });
  }

  private async endGame(gameState: GameState, gameId: string): Promise<void> {
    gameState.status = 'finished';
    
    const finalScores = TsunamiGameLogic.calculateScores(gameState);
    const winner = TsunamiGameLogic.getWinner(gameState);

    // Notify all players
    this.io.to(gameId).emit('game-ended', { winner, finalScores });

    // Update database (simplified for now)
    // await this.gameService.endGameSession(gameId, {
    //   endedAt: new Date(),
    //   winner: { playerId: winner.id, nickname: winner.nickname },
    //   finalScores: finalScores.map(s => ({ 
    //     playerId: s.player.id, 
    //     nickname: s.player.nickname, 
    //     score: s.score 
    //   }))
    // });

    // Clean up
    setTimeout(() => {
      this.cleanupGame(gameId);
    }, 30000); // Clean up after 30 seconds

    console.log(`Game ${gameId} ended. Winner: ${winner.nickname} with score ${winner.score}`);
  }

  // Game Leaving/Aborting
  async leaveGame(socket: GameSocket, gameId: string): Promise<void> {
    try {
      const playerId = socket.data.playerId;
      if (!playerId) return;

      const gameState = this.games.get(gameId);
      if (!gameState) return;

      // Remove player from game
      const playerIndex = gameState.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        gameState.players.splice(playerIndex, 1);
      }

      // Clean up mappings
      this.playerToGame.delete(playerId);
      this.socketToPlayer.delete(socket.id);
      socket.leave(gameId);

      // Notify other players
      this.io.to(gameId).emit('player-left', playerId);

      // If game is empty or creator left, abort game
      if (gameState.players.length === 0 || gameState.createdBy === playerId) {
        await this.abortGame(gameId);
      }

      console.log(`Player ${playerId} left game ${gameId}`);
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  }

  async abortGame(gameId: string): Promise<void> {
    try {
      const gameState = this.games.get(gameId);
      if (!gameState) return;

      // Notify all players
      this.io.to(gameId).emit('game-aborted');

      // Clean up all players
      gameState.players.forEach(player => {
        this.playerToGame.delete(player.id);
        this.socketToPlayer.delete(player.socketId);
      });

      // Remove game
      this.games.delete(gameId);

      console.log(`Game ${gameId} aborted`);
    } catch (error) {
      console.error('Error aborting game:', error);
    }
  }

  // Player Disconnection
  async handleDisconnection(socket: GameSocket): Promise<void> {
    try {
      const playerId = this.socketToPlayer.get(socket.id);
      if (!playerId) return;

      const gameId = this.playerToGame.get(playerId);
      if (!gameId) return;

      const gameState = this.games.get(gameId);
      if (!gameState) return;

      // Update player socket info
      const player = gameState.players.find(p => p.id === playerId);
      if (player) {
        // Mark as disconnected but keep in game for potential reconnection
        this.io.to(gameId).emit('player-disconnected', playerId);
      }

      // Clean up socket mapping
      this.socketToPlayer.delete(socket.id);

      console.log(`Player ${playerId} disconnected from game ${gameId}`);
    } catch (error) {
      console.error('Error handling disconnection:', error);
    }
  }

  // Utility Methods
  private generateGameId(): string {
    // Generate a 6-digit game ID
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private cleanupGame(gameId: string): void {
    const gameState = this.games.get(gameId);
    if (!gameState) return;

    // Clean up all mappings
    gameState.players.forEach(player => {
      this.playerToGame.delete(player.id);
      this.socketToPlayer.delete(player.socketId);
    });

    // Remove game
    this.games.delete(gameId);
    
    console.log(`Game ${gameId} cleaned up`);
  }

  // Authentication handlers (delegated to existing methods)
  async handleUserAuthentication(socket: GameSocket, data: { username: string; password?: string }): Promise<void> {
    // Implementation would go here - integrate with UserService
    socket.emit('authentication-failed', 'Authentication not implemented yet');
  }

  async handleUserCreation(socket: GameSocket, data: { username: string; email?: string; password?: string }): Promise<void> {
    // Implementation would go here - integrate with UserService
    socket.emit('user-creation-failed', 'User creation not implemented yet');
  }

  async handleGetLeaderboard(socket: GameSocket): Promise<void> {
    // Implementation would go here - integrate with UserService
    socket.emit('leaderboard', []);
  }

  async handleGetGameHistory(socket: GameSocket, data?: { userId?: string }): Promise<void> {
    // Implementation would go here - integrate with GameService
    socket.emit('game-history', []);
  }

  // Game Statistics
  getGameStats() {
    return {
      totalGames: this.games.size,
      activeGames: Array.from(this.games.values()).filter(g => g.status === 'playing').length,
      totalPlayers: Array.from(this.games.values()).reduce((sum, game) => sum + game.players.length, 0),
      averageGameDuration: 0 // Would need to track this
    };
  }
} 
