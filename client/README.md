# 🌊 Tsunami Game Client

The frontend client for the Tsunami Game, built with React and Vite.

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

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🔧 Configuration

### Environment Variables

- `VITE_SERVER_URL` - Backend server URL (default: http://localhost:3001)

### Vite

The client uses Vite for fast development and building:
- Hot module replacement
- Fast builds
- Modern JavaScript features
- Proxy configuration for API calls

### ESLint

The client uses ESLint with React-specific rules:
- React hooks rules
- JSX best practices
- Modern JavaScript standards
- Import/export validation

## 🏗️ Architecture

### Components

- `Home.jsx` - Landing page with navigation
- `PlayerView.jsx` - Player interface for joining and playing
- `BoardView.jsx` - Spectator view of the game board
- `GameBoard.jsx` - Interactive game board component

### Contexts

- `SocketContext.jsx` - Socket.io connection and game state management

### Routing

The app uses React Router for navigation:
- `/` - Home page
- `/player` - Player view
- `/board` - Board view

## 🎨 Styling

### CSS Architecture

- `index.css` - Global styles and CSS variables
- `App.css` - Component-specific styles

### Design Features

- Responsive grid layouts
- CSS gradients and animations
- Modern card-based UI
- Interactive hover effects
- Mobile-friendly design

### Color Scheme

- Primary: Blue gradients (#667eea to #764ba2)
- Player colors: Vibrant palette for player identification
- UI: Clean whites and grays with accent colors

## 🔌 Socket.io Integration

### Connection Management

The `SocketContext` handles:
- Automatic connection to server
- Reconnection logic
- Event listeners for game events
- State synchronization

### Real-time Features

- Live player positions
- Instant move updates
- Player join/leave notifications
- Game state synchronization

## 🎮 User Experience

### Player Flow

1. Land on home page
2. Choose player or board view
3. Enter name (for players)
4. Interact with game board
5. See real-time updates

### Responsive Design

- Mobile-first approach
- Flexible grid layouts
- Touch-friendly controls
- Optimized for various screen sizes

## 🔍 Debugging

- React Developer Tools for component inspection
- Browser dev tools for WebSocket monitoring
- Console logs for connection status
- ESLint for code quality issues

## 🚀 Building for Production

1. Build the app:
   ```bash
   npm run build
   ```

2. The `dist` folder contains the production build

3. Deploy to static hosting (Netlify, Vercel, etc.)

4. Update environment variables for production server URL 