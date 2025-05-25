import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import mongoose from 'mongoose';

export interface CreateUserData {
  username: string;
  email?: string;
  password?: string;
}

export interface LoginData {
  username: string;
  password?: string;
}

export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  totalMoves: number;
  totalPlayTime: number;
}

export class UserService {
  private static instance: UserService;
  private jwtSecret: string;

  private constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'tsunami-game-secret-key';
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async createUser(userData: CreateUserData): Promise<IUser> {
    try {
      const existingUser = await User.findOne({ username: userData.username });
      if (existingUser) {
        throw new Error('Username already exists');
      }

      let passwordHash: string | undefined;
      if (userData.password) {
        passwordHash = await bcrypt.hash(userData.password, 12);
      }

      const user = new User({
        username: userData.username,
        email: userData.email,
        passwordHash,
        lastActive: new Date()
      });

      await user.save();
      console.log(`👤 New user created: ${userData.username}`);
      
      return user;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  public async authenticateUser(loginData: LoginData): Promise<{ user: IUser; token?: string }> {
    try {
      const user = await User.findOne({ username: loginData.username }).select('+passwordHash');
      
      if (!user) {
        throw new Error('User not found');
      }

      // If password is provided, verify it
      if (loginData.password && user.passwordHash) {
        const isValidPassword = await bcrypt.compare(loginData.password, user.passwordHash);
        if (!isValidPassword) {
          throw new Error('Invalid password');
        }
      }

      // Update last active
      user.lastActive = new Date();
      await user.save();

      // Generate JWT token if password authentication was used
      let token: string | undefined;
      if (loginData.password && user.passwordHash) {
        token = jwt.sign(
          { userId: user._id, username: user.username },
          this.jwtSecret,
          { expiresIn: '7d' }
        );
      }

      console.log(`👤 User authenticated: ${user.username}`);
      return { user, token };
    } catch (error) {
      console.error('❌ Error authenticating user:', error);
      throw error;
    }
  }

  public async findOrCreateGuestUser(username: string): Promise<IUser> {
    try {
      let user = await User.findOne({ username });
      
      if (!user) {
        user = await this.createUser({ username });
      } else {
        // Update last active for existing user
        user.lastActive = new Date();
        await user.save();
      }

      return user;
    } catch (error) {
      console.error('❌ Error finding/creating guest user:', error);
      throw error;
    }
  }

  public async updateUserStats(
    userId: mongoose.Types.ObjectId, 
    statsUpdate: Partial<UserStats>
  ): Promise<IUser | null> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            'stats.gamesPlayed': statsUpdate.gamesPlayed || 0,
            'stats.wins': statsUpdate.wins || 0,
            'stats.losses': statsUpdate.losses || 0,
            'stats.totalMoves': statsUpdate.totalMoves || 0,
            'stats.totalPlayTime': statsUpdate.totalPlayTime || 0
          },
          lastActive: new Date()
        },
        { new: true }
      );

      if (user) {
        console.log(`📊 Updated stats for user: ${user.username}`);
      }

      return user;
    } catch (error) {
      console.error('❌ Error updating user stats:', error);
      throw error;
    }
  }

  public async getLeaderboard(limit = 10): Promise<IUser[]> {
    try {
      const leaderboard = await User.find({})
        .sort({ 'stats.wins': -1, 'stats.gamesPlayed': -1 })
        .limit(limit)
        .select('username stats createdAt');

      return leaderboard;
    } catch (error) {
      console.error('❌ Error fetching leaderboard:', error);
      throw error;
    }
  }

  public async getUserById(userId: mongoose.Types.ObjectId): Promise<IUser | null> {
    try {
      return await User.findById(userId);
    } catch (error) {
      console.error('❌ Error fetching user by ID:', error);
      throw error;
    }
  }

  public async getUserByUsername(username: string): Promise<IUser | null> {
    try {
      return await User.findOne({ username });
    } catch (error) {
      console.error('❌ Error fetching user by username:', error);
      throw error;
    }
  }

  public verifyToken(token: string): { userId: string; username: string } | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return { userId: decoded.userId, username: decoded.username };
    } catch (error) {
      console.error('❌ Error verifying token:', error);
      return null;
    }
  }
} 