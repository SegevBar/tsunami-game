import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email?: string;
  passwordHash?: string;
  createdAt: Date;
  lastActive: Date;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    totalMoves: number;
    totalPlayTime: number; // in seconds
  };
  preferences: {
    theme?: string;
    soundEnabled: boolean;
  };
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    select: false // Don't include in queries by default
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    totalMoves: { type: Number, default: 0 },
    totalPlayTime: { type: Number, default: 0 }
  },
  preferences: {
    theme: { type: String, default: 'default' },
    soundEnabled: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'stats.wins': -1 }); // For leaderboards

export const User = mongoose.model<IUser>('User', userSchema); 