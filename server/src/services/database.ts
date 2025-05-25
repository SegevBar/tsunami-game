import mongoose from 'mongoose';

export class DatabaseService {
  private static instance: DatabaseService;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('📦 Database already connected');
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }

      await mongoose.connect(mongoUri, {
        dbName: process.env.DB_NAME || 'tsunami-game'
      });

      this.isConnected = true;
      console.log('📦 Connected to MongoDB Atlas');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('📦 MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('📦 MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('📦 Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const adminDb = mongoose.connection.db?.admin();
      const result = await adminDb?.ping();
      
      return {
        status: 'healthy',
        details: {
          connected: this.isConnected,
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          name: mongoose.connection.name,
          ping: result
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connected: this.isConnected,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
} 