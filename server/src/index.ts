import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Handle player joining a game room
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Player ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit('player-joined', { playerId: socket.id });
  });

  // Handle player leaving a game room
  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    console.log(`Player ${socket.id} left room: ${roomId}`);
    socket.to(roomId).emit('player-left', { playerId: socket.id });
  });

  // Handle game actions (to be expanded based on game logic)
  socket.on('game-action', (data: { roomId: string; action: unknown }) => {
    socket.to(data.roomId).emit('game-action', {
      playerId: socket.id,
      action: data.action,
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🌊 Tsunami Game Server running on http://localhost:${PORT}`);
});

