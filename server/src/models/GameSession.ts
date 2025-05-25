import mongoose, { Document, Schema } from 'mongoose';
import { Position } from '../types.js';

export interface IMove {
  playerId: mongoose.Types.ObjectId;
  playerName: string;
  position: Position;
  timestamp: Date;
  turn: number;
}

export interface IGameSession extends Document {
  _id: mongoose.Types.ObjectId;
  players: {
    userId?: mongoose.Types.ObjectId;
    username: string;
    joinedAt: Date;
    leftAt?: Date;
    finalPosition: Position;
  }[];
  gameState: {
    boardSize: { width: number; height: number };
    isActive: boolean;
    startTime: Date;
    endTime?: Date;
    totalTurns: number;
  };
  moves: IMove[];
  winner?: {
    userId?: mongoose.Types.ObjectId;
    username: string;
  };
  gameMode: string;
  roomId?: string;
}

const moveSchema = new Schema<IMove>({
  playerId: { type: Schema.Types.ObjectId, ref: 'User' },
  playerName: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  timestamp: { type: Date, default: Date.now },
  turn: { type: Number, required: true }
});

const gameSessionSchema = new Schema<IGameSession>({
  players: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    username: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    finalPosition: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 }
    }
  }],
  gameState: {
    boardSize: {
      width: { type: Number, default: 10 },
      height: { type: Number, default: 10 }
    },
    isActive: { type: Boolean, default: false },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    totalTurns: { type: Number, default: 0 }
  },
  moves: [moveSchema],
  winner: {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    username: { type: String }
  },
  gameMode: { type: String, default: 'standard' },
  roomId: { type: String }
}, {
  timestamps: true
});

// Indexes for performance
gameSessionSchema.index({ 'gameState.startTime': -1 });
gameSessionSchema.index({ 'players.userId': 1 });
gameSessionSchema.index({ roomId: 1 });

export const GameSession = mongoose.model<IGameSession>('GameSession', gameSessionSchema); 