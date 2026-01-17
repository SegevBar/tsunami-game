import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { config } from './config';
import { router } from './routes';
import { createSocketServer } from './socket';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(router);

// Socket.io
createSocketServer(httpServer);

// Start server
httpServer.listen(config.port, () => {
  console.log(`🌊 Tsunami Game Server running on http://localhost:${config.port}`);
});
