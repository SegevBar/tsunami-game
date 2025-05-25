# Database Setup Guide

This guide will help you set up MongoDB Atlas for the Tsunami Game project.

## MongoDB Atlas Setup

### 1. Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account or log in if you already have one
3. Create a new project called "Tsunami Game"

### 2. Create a Cluster

1. Click "Build a Database"
2. Choose the **FREE** tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "tsunami-game-cluster")
5. Click "Create Cluster"

### 3. Configure Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and secure password
5. Set database user privileges to "Read and write to any database"
6. Click "Add User"

### 4. Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, you can click "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note**: For production, restrict to specific IP addresses
4. Click "Confirm"

### 5. Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp server/env.example server/.env
```

### 2. Configure Environment Variables

Edit `server/.env` with your MongoDB Atlas details:

```env
# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:3000

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/
DB_NAME=tsunami-game

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment
NODE_ENV=development
```

**Important**: Replace the following in your connection string:
- `your-username`: Your database username
- `your-password`: Your database password
- `your-cluster`: Your cluster name

### 3. Security Notes

- **Never commit your `.env` file to version control**
- Use a strong, unique JWT secret in production
- For production deployments, use environment variables instead of `.env` files
- Restrict MongoDB network access to specific IP addresses in production

## Database Schema

The application uses the following collections:

### Users Collection
- Stores user profiles, authentication data, and game statistics
- Indexes on username, email, and wins for performance

### GameSessions Collection
- Stores complete game history including moves and outcomes
- Indexes on start time, players, and room ID

## Features Enabled by Database Integration

### User Management
- **Guest Users**: Automatic user creation for players without accounts
- **Registered Users**: Full authentication with email and password
- **User Statistics**: Games played, wins, losses, total moves, play time

### Game Persistence
- **Game Sessions**: Complete game history with all moves
- **Player Tracking**: Final positions and participation records
- **Game Analytics**: Duration, turn count, and outcome tracking

### Social Features
- **Leaderboards**: Rankings based on wins and games played
- **Game History**: View past games and replay moves
- **User Profiles**: Personal statistics and preferences

## API Endpoints

### Health Check
```
GET /health
```
Returns server and database status.

### Game Statistics
```
GET /api/stats
```
Returns overall game statistics (to be implemented).

## Socket Events

### Authentication Events
- `authenticate-user`: Login with username/password
- `create-user`: Register new user account
- `user-authenticated`: Response with user data and JWT token

### Data Events
- `get-leaderboard`: Request current leaderboard
- `leaderboard-updated`: Receive leaderboard data
- `get-game-history`: Request game history
- `game-history`: Receive game session data

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Troubleshooting

### Connection Issues
1. Verify your connection string is correct
2. Check that your IP address is whitelisted
3. Ensure database user has proper permissions
4. Verify the database name in your connection string

### Authentication Issues
1. Double-check username and password in connection string
2. Ensure the database user exists and has correct permissions
3. Try connecting with MongoDB Compass to test credentials

### Performance Considerations
1. The free tier (M0) has limitations on connections and storage
2. Consider upgrading to M2+ for production use
3. Monitor your usage in the Atlas dashboard

## Production Deployment

For production deployment:

1. **Use environment variables** instead of `.env` files
2. **Restrict network access** to your server's IP addresses
3. **Use a dedicated database** separate from development
4. **Enable MongoDB Atlas monitoring** and alerts
5. **Set up automated backups**
6. **Use a strong JWT secret** and rotate it regularly

## Support

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Socket.io Documentation](https://socket.io/docs/) 