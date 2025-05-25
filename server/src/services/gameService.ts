import { GameSession, IGameSession, IMove } from '../models/GameSession.js';
import { UserService } from './userService.js';
import { Position, Player } from '../types.js';
import mongoose from 'mongoose';

export interface GameSessionData {
  players: Player[];
  roomId?: string;
  gameMode?: string;
}

export class GameService {
  private static instance: GameService;
  private userService: UserService;

  private constructor() {
    this.userService = UserService.getInstance();
  }

  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  public async createGameSession(data: GameSessionData): Promise<IGameSession> {
    try {
      const gameSession = new GameSession({
        players: data.players.map(player => ({
          userId: player.userId ? new mongoose.Types.ObjectId(player.userId) : undefined,
          username: player.name,
          joinedAt: new Date(),
          finalPosition: player.position
        })),
        gameState: {
          boardSize: { width: 10, height: 10 },
          isActive: true,
          startTime: new Date(),
          totalTurns: 0
        },
        moves: [],
        gameMode: data.gameMode || 'standard',
        roomId: data.roomId
      });

      await gameSession.save();
      console.log(`🎮 New game session created: ${gameSession._id}`);
      
      return gameSession;
    } catch (error) {
      console.error('❌ Error creating game session:', error);
      throw error;
    }
  }

  public async addMoveToSession(
    sessionId: mongoose.Types.ObjectId,
    playerId: string,
    playerName: string,
    position: Position,
    turn: number
  ): Promise<IGameSession | null> {
    try {
      const move: IMove = {
        playerId: new mongoose.Types.ObjectId(playerId),
        playerName,
        position,
        timestamp: new Date(),
        turn
      };

      const session = await GameSession.findByIdAndUpdate(
        sessionId,
        {
          $push: { moves: move },
          $inc: { 'gameState.totalTurns': 1 }
        },
        { new: true }
      );

      return session;
    } catch (error) {
      console.error('❌ Error adding move to session:', error);
      throw error;
    }
  }

  public async endGameSession(
    sessionId: mongoose.Types.ObjectId,
    winner?: { userId?: string; username: string }
  ): Promise<IGameSession | null> {
    try {
      const updateData: any = {
        'gameState.isActive': false,
        'gameState.endTime': new Date()
      };

      if (winner) {
        updateData.winner = {
          userId: winner.userId ? new mongoose.Types.ObjectId(winner.userId) : undefined,
          username: winner.username
        };
      }

      const session = await GameSession.findByIdAndUpdate(
        sessionId,
        updateData,
        { new: true }
      );

      if (session && winner?.userId) {
        // Update winner stats
        await this.userService.updateUserStats(
          new mongoose.Types.ObjectId(winner.userId),
          { wins: 1, gamesPlayed: 1 }
        );

        // Update loser stats
        for (const player of session.players) {
          if (player.userId && player.userId.toString() !== winner.userId) {
            await this.userService.updateUserStats(
              player.userId,
              { losses: 1, gamesPlayed: 1 }
            );
          }
        }
      }

      console.log(`🏁 Game session ended: ${sessionId}`);
      return session;
    } catch (error) {
      console.error('❌ Error ending game session:', error);
      throw error;
    }
  }

  public async getGameHistory(
    userId?: mongoose.Types.ObjectId,
    limit = 20
  ): Promise<IGameSession[]> {
    try {
      const query = userId ? { 'players.userId': userId } : {};
      
      const sessions = await GameSession.find(query)
        .sort({ 'gameState.startTime': -1 })
        .limit(limit)
        .populate('players.userId', 'username stats')
        .populate('winner.userId', 'username');

      return sessions;
    } catch (error) {
      console.error('❌ Error fetching game history:', error);
      throw error;
    }
  }

  public async getGameSession(sessionId: mongoose.Types.ObjectId): Promise<IGameSession | null> {
    try {
      return await GameSession.findById(sessionId)
        .populate('players.userId', 'username stats')
        .populate('winner.userId', 'username');
    } catch (error) {
      console.error('❌ Error fetching game session:', error);
      throw error;
    }
  }

  public async getActiveGames(): Promise<IGameSession[]> {
    try {
      return await GameSession.find({ 'gameState.isActive': true })
        .sort({ 'gameState.startTime': -1 })
        .populate('players.userId', 'username');
    } catch (error) {
      console.error('❌ Error fetching active games:', error);
      throw error;
    }
  }

  public async updatePlayerPosition(
    sessionId: mongoose.Types.ObjectId,
    playerId: string,
    position: Position
  ): Promise<IGameSession | null> {
    try {
      const session = await GameSession.findOneAndUpdate(
        { 
          _id: sessionId,
          'players.userId': new mongoose.Types.ObjectId(playerId)
        },
        {
          $set: { 'players.$.finalPosition': position }
        },
        { new: true }
      );

      return session;
    } catch (error) {
      console.error('❌ Error updating player position:', error);
      throw error;
    }
  }

  public async getGameStats(): Promise<{
    totalGames: number;
    activeGames: number;
    totalPlayers: number;
    averageGameDuration: number;
  }> {
    try {
      const [totalGames, activeGames, gameStats] = await Promise.all([
        GameSession.countDocuments(),
        GameSession.countDocuments({ 'gameState.isActive': true }),
        GameSession.aggregate([
          { $match: { 'gameState.endTime': { $exists: true } } },
          {
            $project: {
              duration: {
                $subtract: ['$gameState.endTime', '$gameState.startTime']
              },
              playerCount: { $size: '$players' }
            }
          },
          {
            $group: {
              _id: null,
              avgDuration: { $avg: '$duration' },
              totalPlayers: { $sum: '$playerCount' }
            }
          }
        ])
      ]);

      const stats = gameStats[0] || { avgDuration: 0, totalPlayers: 0 };

      return {
        totalGames,
        activeGames,
        totalPlayers: stats.totalPlayers,
        averageGameDuration: Math.round(stats.avgDuration / 1000) // Convert to seconds
      };
    } catch (error) {
      console.error('❌ Error fetching game stats:', error);
      throw error;
    }
  }
} 