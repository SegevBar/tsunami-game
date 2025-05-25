# 🌊 Tsunami Game Server

The backend server for the Tsunami Game, built with Express.js and Socket.io.

## 🚀 Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## 📋 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🔧 Configuration

### Environment Variables

- `PORT` - Server port (default: 3001)
- `CLIENT_URL` - Client URL for CORS (default: http://localhost:3000)
- `NODE_ENV` - Environment (development/production)

### ESLint

The server uses ESLint with modern ES modules configuration. Rules include:
- ES2022 features
- Node.js globals
- Consistent code style
- Error prevention

## 🏗️ Architecture

### Files

- `src/index.js` - Main server entry point with Express and Socket.io setup
- `src/gameManager.js` - Game logic, player management, and state handling

### Socket.io Events

#### Incoming (from clients):
- `join-game` - Player wants to join
- `join-as-board` - Client wants to view board
- `player-move` - Player makes a move

#### Outgoing (to clients):
- `player-joined` - Player successfully joined
- `board-connected` - Board client connected
- `player-connected` - New player joined
- `player-disconnected` - Player left
- `player-moved` - Player moved
- `game-started` - Game started
- `game-reset` - Game reset
- `invalid-move` - Move was invalid

## 🎮 Game Logic

The `GameManager` class handles:
- Player connections and disconnections
- Game state management
- Move validation
- Broadcasting events to all clients
- Board state updates

### Customization

You can customize the game by modifying:
- Board size in `initializeBoard()`
- Move validation in `isValidMove()`
- Game state updates in `updateGameState()`
- Win conditions (add your own logic)

## 🔍 Debugging

- Server logs all connections and disconnections
- Use browser dev tools to monitor WebSocket connections
- Check console for game events and errors 