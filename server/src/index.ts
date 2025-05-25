import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './gameManager.js';
import { DatabaseService } from './services/database.js';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  MoveData
} from './types.js';

const app = express();
const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      process.env.CLIENT_URL || 'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    process.env.CLIENT_URL || 'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Initialize services
const databaseService = DatabaseService.getInstance();
const gameManager = new GameManager(io);

// Basic health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await databaseService.healthCheck();
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: dbHealth
  });
});

// API endpoints for database stats
app.get('/api/stats', async (req, res) => {
  try {
    // This would require implementing getGameStats in GameService
    res.json({ message: 'Stats endpoint - implement game stats here' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Game management
  socket.on('create-game', async (data: { maxPlayers: number; nickname: string; email?: string }) => {
    await gameManager.createGame(socket, data);
  });

  socket.on('join-game', async (data: { gameId: string; nickname: string; email?: string }) => {
    await gameManager.joinGame(socket, data);
  });

  socket.on('start-game', async (gameId: string) => {
    await gameManager.startGame(socket, gameId);
  });

  socket.on('abort-game', async (gameId: string) => {
    await gameManager.abortGame(gameId);
  });

  socket.on('leave-game', async (gameId: string) => {
    await gameManager.leaveGame(socket, gameId);
  });

  // Game actions
  socket.on('make-move', async (data: MoveData) => {
    await gameManager.handleMove(socket, data);
  });

  // Handle user authentication
  socket.on('authenticate-user', async (data: { username: string; password?: string }) => {
    await gameManager.handleUserAuthentication(socket, data);
  });

  // Handle user creation
  socket.on('create-user', async (data: { username: string; email?: string; password?: string }) => {
    await gameManager.handleUserCreation(socket, data);
  });

  // Handle leaderboard requests
  socket.on('get-leaderboard', async () => {
    await gameManager.handleGetLeaderboard(socket);
  });

  // Handle game history requests
  socket.on('get-game-history', async (data?: { userId?: string }) => {
    await gameManager.handleGetGameHistory(socket, data);
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log(`Client disconnected: ${socket.id}`);
    await gameManager.handleDisconnection(socket);
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    await databaseService.connect();
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('🎮 Game server ready for connections');
      console.log('📦 Database connected and ready');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    await databaseService.disconnect();
    server.close(() => {
      console.log('✅ Server shut down gracefully');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  try {
    await databaseService.disconnect();
    server.close(() => {
      console.log('✅ Server shut down gracefully');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
startServer(); 