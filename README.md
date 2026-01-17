# 🌊 Tsunami Game

A multiplayer game with client-server architecture.

## Tech Stack

- **Server**: Express.js + Socket.io (TypeScript)
- **Client**: React + Vite (TypeScript)

## Getting Started

### Install Dependencies

```bash
# Install all dependencies (uses Yarn workspaces)
yarn install
```

### Development

```bash
# Run both server and client in development mode
yarn dev

# Or run them separately:
yarn dev:server  # Server on http://localhost:3001
yarn dev:client  # Client on http://localhost:5173
```

### Build for Production

```bash
yarn build
```

## Project Structure

```
tsunami-game/
├── server/           # Express + Socket.io backend
│   ├── src/
│   │   └── index.ts  # Server entry point
│   └── package.json
├── client/           # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx   # Main React component
│   │   ├── socket.ts # Socket.io client setup
│   │   └── ...
│   └── package.json
└── package.json      # Root workspace scripts
```

