# 🌊 Tsunami Game

A real-time multiplayer game built with React and Node.js using Socket.io for real-time communication. **Now fully written in TypeScript with MongoDB Atlas integration!**

## 🏗️ Architecture

This project follows a client-server architecture with full TypeScript support and database persistence:

- **Server**: Express.js with Socket.io for real-time communication (TypeScript)
- **Client**: React with Vite for the frontend (TypeScript)
- **Database**: MongoDB Atlas for user persistence and game history
- **Communication**: WebSocket connections via Socket.io with typed events
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Authentication**: JWT-based authentication with bcrypt password hashing

## 📁 Project Structure

```
tsunami-game/
├── server/                 # Backend server (TypeScript)
│   ├── src/
│   │   ├── index.ts       # Main server entry point
│   │   ├── gameManager.ts # Game logic and state management
│   │   ├── types.ts       # TypeScript type definitions
│   │   ├── models/        # MongoDB models
│   │   │   ├── User.ts    # User model with stats
│   │   │   └── GameSession.ts # Game session model
│   │   └── services/      # Business logic services
│   │       ├── database.ts    # Database connection service
│   │       ├── userService.ts # User management service
│   │       └── gameService.ts # Game persistence service
│   ├── package.json       # Server dependencies
│   ├── tsconfig.json      # TypeScript configuration
│   ├── eslint.config.js   # ESLint configuration
│   └── env.example        # Environment variables example
├── client/                 # Frontend React app (TypeScript)
│   ├── src/
│   │   ├── components/    # React components (.tsx)
│   │   ├── contexts/      # React contexts (.tsx)
│   │   ├── types.ts       # TypeScript type definitions
│   │   ├── App.tsx        # Main App component
│   │   ├── main.tsx       # React entry point
│   │   ├── App.css        # Styles
│   │   └── index.css      # Global styles
│   ├── package.json       # Client dependencies
│   ├── tsconfig.json      # TypeScript configuration
│   ├── tsconfig.node.json # Node.js TypeScript config
│   ├── vite.config.ts     # Vite configuration
│   ├── eslint.config.js   # ESLint configuration
│   ├── index.html         # HTML template
│   └── env.example        # Environment variables example
├── DATABASE_SETUP.md       # MongoDB Atlas setup guide
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- TypeScript knowledge (helpful but not required)
- MongoDB Atlas account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tsunami-game
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up MongoDB Atlas**
   
   Follow the detailed guide in [DATABASE_SETUP.md](./DATABASE_SETUP.md) to:
   - Create a MongoDB Atlas account
   - Set up a free cluster
   - Configure database access and network settings
   - Get your connection string

4. **Set up environment variables**
   
   For the server:
   ```bash
   cd server
   cp env.example .env
   # Edit .env file with your MongoDB Atlas connection string
   ```
   
   For the client:
   ```bash
   cd ../client
   cp env.example .env
   # Edit .env file if needed
   ```

### Running the Application

1. **Start both server and client** (from root directory):
   ```bash
   npm run dev
   ```

   Or start them separately:
   ```bash
   # Terminal 1 - Server
   npm run dev:server
   
   # Terminal 2 - Client  
   npm run dev:client
   ```

2. **Open your browser** and navigate to `http://localhost:3000`

## 🎮 How to Play

### For Players:
1. Go to `http://localhost:3000`
2. Click "Join Game"
3. Enter your name (automatically creates a user account)
4. Use the controls to move around the board
5. See other players in real-time
6. View your statistics and game history

### For Spectators:
1. Go to `http://localhost:3000`
2. Click "View Board"
3. Watch all players and game statistics in real-time

### User Features:
- **Guest Mode**: Play immediately with just a username
- **Statistics Tracking**: Games played, wins, losses, total moves
- **Leaderboards**: See top players ranked by wins
- **Game History**: View past games and replay moves
- **Persistent Profiles**: Your stats are saved across sessions

## 🛠️ Development

### Available Scripts

#### Root Directory
- `npm run install:all` - Install dependencies for all projects
- `npm run dev` - Start both server and client in development mode
- `npm run build` - Build both server and client for production
- `npm run lint:all` - Run ESLint on both projects
- `npm run lint:fix:all` - Fix ESLint errors on both projects
- `npm run type-check:all` - Run TypeScript type checking on both projects

#### Server
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

#### Client
- `npm run dev` - Start the development server
- `npm run build` - Build for production (includes TypeScript compilation)
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run type-check` - Run TypeScript type checking without emitting files

### TypeScript Features

#### Type Safety
- **Strict TypeScript configuration** with comprehensive type checking
- **Typed Socket.io events** for client-server communication
- **Interface definitions** for all game entities (Player, GameState, etc.)
- **Type-safe React components** with proper prop typing

#### Development Experience
- **IntelliSense support** in VS Code and other TypeScript-aware editors
- **Compile-time error detection** to catch issues before runtime
- **Refactoring support** with confidence across the codebase
- **Auto-completion** for all typed entities and functions

### Code Quality

Both server and client are configured with:

- **TypeScript**: Strict type checking and modern ES features
- **ESLint**: Code quality enforcement with TypeScript-specific rules
- **Consistent formatting**: Unified code style across the project

### Socket.io Events (Typed)

#### Client to Server:
- `join-game` - Player joins the game
- `join-as-board` - Client connects as board viewer
- `player-move` - Player makes a move
- `authenticate-user` - Login with username/password
- `create-user` - Register new user account
- `get-leaderboard` - Request current leaderboard
- `get-game-history` - Request game history

#### Server to Client:
- `player-joined` - Confirmation of player joining
- `board-connected` - Confirmation of board client connection
- `player-connected` - New player joined
- `player-disconnected` - Player left
- `player-moved` - Player made a move
- `game-started` - Game has started
- `game-reset` - Game has been reset
- `invalid-move` - Move was invalid
- `user-authenticated` - User login response with data and JWT token
- `leaderboard-updated` - Current leaderboard data
- `game-history` - Game session history data

All events are fully typed with TypeScript interfaces!

## 🎯 Features

### Core Game Features
- ✅ **Full TypeScript support** with strict type checking
- ✅ **Type-safe Socket.io communication** between client and server
- ✅ Real-time multiplayer gameplay
- ✅ Separate player and board views
- ✅ Interactive game board
- ✅ Player movement controls
- ✅ Live player list and statistics
- ✅ Responsive design
- ✅ Modern UI with gradients and animations
- ✅ ESLint configuration for code quality
- ✅ Environment variable support
- ✅ **Hot reload** in development for both client and server

### Database & User Features
- ✅ **MongoDB Atlas integration** with Mongoose ODM
- ✅ **User persistence** with automatic guest account creation
- ✅ **Game session tracking** with complete move history
- ✅ **User statistics** (games played, wins, losses, total moves)
- ✅ **Leaderboards** ranked by wins and games played
- ✅ **Game history** with replay capability
- ✅ **JWT authentication** for registered users
- ✅ **Password hashing** with bcrypt for security
- ✅ **Database health monitoring** and connection management
- ✅ **Graceful shutdown** with proper database cleanup

## 🔧 Customization

### Game Logic (TypeScript)
The game logic is in `server/src/gameManager.ts`. You can customize:
- Board size and initialization
- Move validation rules
- Game state updates
- Win conditions

All with full TypeScript support and type safety!

### UI Components (TypeScript + React)
The React components are in `client/src/components/`. You can customize:
- Game board appearance
- Player controls
- Statistics display
- Styling and animations

### Type Definitions
Shared types are defined in:
- `server/src/types.ts` - Server-side types
- `client/src/types.ts` - Client-side types

## 🚀 Deployment

### Server Deployment
1. Build the server:
   ```bash
   cd server && npm run build
   ```
2. The compiled JavaScript will be in the `dist` folder
3. Set environment variables
4. Deploy to your preferred platform (Heroku, DigitalOcean, AWS, etc.)

### Client Deployment
1. Build the client:
   ```bash
   cd client && npm run build
   ```
2. Deploy the `dist` folder to your preferred static hosting (Netlify, Vercel, etc.)
3. Update the `VITE_SERVER_URL` environment variable to point to your deployed server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes (TypeScript preferred!)
4. Run type checking: `npm run type-check:all`
5. Run linting: `npm run lint:all`
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **TypeScript Errors**: Run `npm run type-check:all` to see all type errors
2. **Connection Issues**: Make sure both server and client are running and the ports are correct
3. **CORS Errors**: Check that the server CORS configuration includes your client URL
4. **Socket Connection Failed**: Verify the `VITE_SERVER_URL` environment variable in the client

### Development Tips

- Use TypeScript-aware editors like VS Code for the best development experience
- Enable TypeScript strict mode for maximum type safety
- Use browser developer tools to monitor WebSocket connections
- Check server logs for connection and game events
- Use React Developer Tools for debugging component state
- ESLint will help catch common issues during development

## 🎨 Future Enhancements

- [ ] **Database integration** with TypeScript ORMs (Prisma, TypeORM)
- [ ] **Authentication system** with typed user sessions
- [ ] **Game rooms/lobbies** with type-safe room management
- [ ] **Real-time chat** with typed message events
- [ ] **Game replay system** with typed game history
- [ ] **Different game modes** with polymorphic game types
- [ ] **Mobile app version** using React Native with TypeScript
- [ ] **Player statistics and leaderboards** with typed data models

## 🔍 TypeScript Benefits in This Project

1. **Compile-time Safety**: Catch errors before they reach production
2. **Better IDE Support**: IntelliSense, refactoring, and navigation
3. **Self-documenting Code**: Types serve as inline documentation
4. **Easier Refactoring**: Confident code changes across the entire codebase
5. **Team Collaboration**: Clear contracts between different parts of the application
6. **Reduced Runtime Errors**: Many common JavaScript errors are prevented at compile time