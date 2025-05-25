import { v4 as uuidv4 } from 'uuid';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import {
  GameState,
  GameBoard,
  Player,
  PlayerData,
  MoveData,
  PlayerInfo,
  Position,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData
} from './types.js';
import { UserService } from './services/userService.js';
import { GameService } from './services/gameService.js';

export class GameManager {
  private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private players: Map<string, Player>;
  private boardClients: Set<Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>>;
  private gameState: GameState;
  private userService: UserService;
  private gameService: GameService;
  private currentGameSession: mongoose.Types.ObjectId | null = null;

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
    this.io = io;
    this.players = new Map();
    this.boardClients = new Set();
    this.gameState = {
      isActive: false,
      currentPlayer: null,
      board: this.initializeBoard(),
      turn: 0
    };
    this.userService = UserService.getInstance();
    this.gameService = GameService.getInstance();
  }

  private initializeBoard(): GameBoard {
    // Initialize a basic game board - customize based on your game needs
    return {
      width: 10,
      height: 10,
      tiles: Array(10).fill(null).map(() => Array(10).fill(null))
    };
  }

  public async addPlayer(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, playerData: PlayerData): Promise<void> {
    try {
      const playerId = uuidv4();
      
      // Handle user authentication/creation if username is provided
      let userId: string | undefined;
      if (playerData.name) {
        const user = await this.userService.findOrCreateGuestUser(playerData.name);
        userId = user._id.toString();
        socket.data.userId = userId;
        socket.data.username = user.username;
      }

      const player: Player = {
        id: playerId,
        socket,
        name: playerData.name || `Player ${this.players.size + 1}`,
        isReady: false,
        position: { x: 0, y: 0 },
        userId,
        ...playerData
      };

      this.players.set(socket.id, player);
      
      // Send player their ID and current game state
      socket.emit('player-joined', {
        playerId,
        gameState: this.gameState,
        players: Array.from(this.players.values()).map(p => this.getPlayerInfo(p))
      });

      // Notify all clients about new player
      this.broadcastToAll('player-connected', {
        player: this.getPlayerInfo(player)
      });

      console.log(`Player ${player.name} joined the game (User ID: ${userId})`);

      // Create game session if this is the first player and game isn't active
      if (this.players.size === 1 && !this.gameState.isActive) {
        await this.createGameSession();
      }
    } catch (error) {
      console.error('Error adding player:', error);
      socket.emit('invalid-move', { reason: 'Failed to join game' });
    }
  }

  public addBoardClient(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): void {
    this.boardClients.add(socket);
    
    // Send current game state to board client
    socket.emit('board-connected', {
      gameState: this.gameState,
      players: Array.from(this.players.values()).map(p => this.getPlayerInfo(p))
    });

    console.log('Board client connected');
  }

  public async handlePlayerMove(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, moveData: MoveData): Promise<void> {
    const player = this.players.get(socket.id);
    if (!player) return;

    try {
      // Validate and process move
      if (this.isValidMove(player, moveData)) {
        // Update player position
        player.position = moveData.position;
        
        // Update game state if needed
        this.updateGameState(player, moveData);

        // Save move to database if game session exists
        if (this.currentGameSession && player.userId) {
          await this.gameService.addMoveToSession(
            this.currentGameSession,
            player.userId,
            player.name,
            moveData.position,
            this.gameState.turn
          );

          // Update user stats
          await this.userService.updateUserStats(
            new mongoose.Types.ObjectId(player.userId),
            { totalMoves: 1 }
          );
        }

        // Broadcast move to all clients
        this.broadcastToAll('player-moved', {
          playerId: player.id,
          moveData,
          gameState: this.gameState
        });
      } else {
        socket.emit('invalid-move', { reason: 'Move not allowed' });
      }
    } catch (error) {
      console.error('Error handling player move:', error);
      socket.emit('invalid-move', { reason: 'Failed to process move' });
    }
  }

  public async handleUserAuthentication(socket: Socket, data: { username: string; password?: string }): Promise<void> {
    try {
      const result = await this.userService.authenticateUser(data);
      
      socket.data.userId = result.user._id.toString();
      socket.data.username = result.user.username;

      socket.emit('user-authenticated', {
        user: {
          _id: result.user._id.toString(),
          username: result.user.username,
          email: result.user.email,
          stats: result.user.stats,
          preferences: result.user.preferences,
          createdAt: result.user.createdAt,
          lastActive: result.user.lastActive
        },
        token: result.token
      });

      console.log(`User authenticated: ${result.user.username}`);
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('invalid-move', { reason: 'Authentication failed' });
    }
  }

  public async handleUserCreation(socket: Socket, data: { username: string; email?: string; password?: string }): Promise<void> {
    try {
      const user = await this.userService.createUser(data);
      
      socket.data.userId = user._id.toString();
      socket.data.username = user.username;

      socket.emit('user-authenticated', {
        user: {
          _id: user._id.toString(),
          username: user.username,
          email: user.email,
          stats: user.stats,
          preferences: user.preferences,
          createdAt: user.createdAt,
          lastActive: user.lastActive
        }
      });

      console.log(`New user created: ${user.username}`);
    } catch (error) {
      console.error('User creation error:', error);
      socket.emit('invalid-move', { reason: 'User creation failed' });
    }
  }

  public async handleGetLeaderboard(socket: Socket): Promise<void> {
    try {
      const leaderboard = await this.userService.getLeaderboard();
      
      socket.emit('leaderboard-updated', {
        leaderboard: leaderboard.map(user => ({
          _id: user._id.toString(),
          username: user.username,
          email: user.email,
          stats: user.stats,
          preferences: user.preferences,
          createdAt: user.createdAt,
          lastActive: user.lastActive
        }))
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }

  public async handleGetGameHistory(socket: Socket, data?: { userId?: string }): Promise<void> {
    try {
      const userId = data?.userId ? new mongoose.Types.ObjectId(data.userId) : undefined;
      const sessions = await this.gameService.getGameHistory(userId);
      
      socket.emit('game-history', { sessions });
    } catch (error) {
      console.error('Error fetching game history:', error);
    }
  }

  private async createGameSession(): Promise<void> {
    try {
      const players = Array.from(this.players.values());
      const session = await this.gameService.createGameSession({
        players,
        gameMode: 'standard'
      });
      
      this.currentGameSession = session._id;
      console.log(`Game session created: ${session._id}`);
    } catch (error) {
      console.error('Error creating game session:', error);
    }
  }

  private isValidMove(player: Player, moveData: MoveData): boolean {
    // Implement your game-specific move validation logic
    const { x, y } = moveData.position;
    return x >= 0 && x < this.gameState.board.width && 
           y >= 0 && y < this.gameState.board.height;
  }

  private updateGameState(player: Player, moveData: MoveData): void {
    // Implement your game-specific state update logic
    this.gameState.turn++;
    
    // Example: Update board tile
    if (moveData.position) {
      const { x, y } = moveData.position;
      const tile = this.gameState.board.tiles[y];
      if (tile) {
        tile[x] = player.id;
      }
    }
  }

  public async removePlayer(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): Promise<void> {
    const player = this.players.get(socket.id);
    if (player) {
      this.players.delete(socket.id);
      
      // Update final position in game session
      if (this.currentGameSession && player.userId) {
        await this.gameService.updatePlayerPosition(
          this.currentGameSession,
          player.userId,
          player.position
        );
      }
      
      // Notify all clients about player disconnection
      this.broadcastToAll('player-disconnected', {
        playerId: player.id
      });

      console.log(`Player ${player.name} left the game`);

      // End game session if no players left
      if (this.players.size === 0 && this.currentGameSession) {
        await this.gameService.endGameSession(this.currentGameSession);
        this.currentGameSession = null;
      }
    }

    // Remove from board clients if it was a board client
    this.boardClients.delete(socket);
  }

  private broadcastToAll(event: keyof ServerToClientEvents, data: Parameters<ServerToClientEvents[keyof ServerToClientEvents]>[0]): void {
    // Broadcast to all players
    this.players.forEach(player => {
      (player.socket.emit as any)(event, data);
    });

    // Broadcast to all board clients
    this.boardClients.forEach(boardSocket => {
      (boardSocket.emit as any)(event, data);
    });
  }

  public async startGame(): Promise<void> {
    this.gameState.isActive = true;
    const firstPlayer = Array.from(this.players.values())[0];
    this.gameState.currentPlayer = firstPlayer?.id || null;
    
    this.broadcastToAll('game-started', {
      gameState: this.gameState
    });

    // Update game session to active
    if (this.currentGameSession) {
      // Game session is already created and active by default
      console.log(`Game started with session: ${this.currentGameSession}`);
    }
  }

  public async resetGame(): Promise<void> {
    // End current game session if exists
    if (this.currentGameSession) {
      await this.gameService.endGameSession(this.currentGameSession);
      this.currentGameSession = null;
    }

    this.gameState = {
      isActive: false,
      currentPlayer: null,
      board: this.initializeBoard(),
      turn: 0
    };

    this.broadcastToAll('game-reset', {
      gameState: this.gameState
    });

    // Create new game session if players are still connected
    if (this.players.size > 0) {
      await this.createGameSession();
    }
  }

  private getPlayerInfo(player: Player): PlayerInfo {
    return {
      id: player.id,
      name: player.name,
      isReady: player.isReady,
      position: player.position,
      userId: player.userId
    };
  }
} 